"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout/Layout"
import { BackgroundElements } from "@/components/ui/BackgroundElements"
import {
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Download,
  Search,
  Eye,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"

interface OfframpRequest {
  id: string
  user_id: string
  fiat_amount: number
  amount: number
  token: string
  fiat_currency: string
  bank_account_number: string
  bank_code: string
  bank_name: string
  status: string
  fiat_disbursement_status: string
  disbursed_at: string | null
  payout_reference: string | null
  admin_note: string | null
  created_at: string
  user_name?: string
  user_email?: string
  user_wallet?: string
}

export default function AdminOfframpPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<OfframpRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<OfframpRequest[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<OfframpRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<string>("table")
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false)

  useEffect(() => {
    fetchOfframpRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter])

  const filterRequests = () => {
    let filtered = [...requests]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (req) =>
          req.user_name?.toLowerCase().includes(term) ||
          req.user_email?.toLowerCase().includes(term) ||
          req.bank_name.toLowerCase().includes(term) ||
          req.bank_account_number.includes(term) ||
          (req.payout_reference && req.payout_reference.toLowerCase().includes(term))
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) =>
        statusFilter === "pending_all"
          ? req.status === "pending" || req.fiat_disbursement_status === "pending"
          : req.status === statusFilter || req.fiat_disbursement_status === statusFilter
      )
    }

    setFilteredRequests(filtered)
  }

  const fetchOfframpRequests = async () => {
    setLoading(true)

    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from("offramp_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (requestsError) {
        console.error("Error fetching offramp requests:", requestsError.message)
        return
      }

      if (!requestsData || requestsData.length === 0) {
        setRequests([])
        return
      }

      const processedRequests = requestsData.map((request: any) => ({
        ...request,
        user_name: "Loading...",
        user_email: "Loading...",
        user_wallet: "Loading...",
      }))

      setRequests(processedRequests)

      const userIds = [...new Set(requestsData.map((req: any) => req.user_id))]

      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email, wallet")
          .in("id", userIds)

        if (!usersError && usersData) {
          const userMap = usersData.reduce((acc: any, user: any) => {
            acc[user.id] = user
            return acc
          }, {})

          const enrichedRequests = processedRequests.map((request: any) => ({
            ...request,
            user_name: userMap[request.user_id]?.name || "Unknown",
            user_email: userMap[request.user_id]?.email || "Unknown",
            user_wallet: userMap[request.user_id]?.wallet || "N/A",
          }))

          setRequests(enrichedRequests)
        }
      }
    } catch (err) {
      console.error("Error processing user data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerPayout = async (requestId: string) => {
    setLoading(true)

    try {
      const res = await fetch("/api/offramp/trigger-payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_id: requestId }),
      })

      const result = await res.json()

      if (result.success) {
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  fiat_disbursement_status: "disbursed",
                  disbursed_at: new Date().toISOString(),
                }
              : req
          )
        )
        setIsDialogOpen(false)
      } else {
        alert("Error triggering payout: " + result.error)
      }
    } catch (error) {
      console.error("Error triggering payout:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not disbursed yet"
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`
  }

  const exportToCSV = () => {
    const headers = [
      "User Name",
      "User Email",
      "Token Amount",
      "Fiat Amount",
      "Bank Name",
      "Account Number",
      "Bank Code",
      "Status",
      "Disbursement Status",
      "Disbursed At",
      "Payout Reference",
      "Created At",
    ]

    const csvData = filteredRequests.map((req) => [
      req.user_name,
      req.user_email,
      `${req.amount} ${req.token}`,
      `${req.fiat_amount} ${req.fiat_currency}`,
      req.bank_name,
      req.bank_account_number,
      req.bank_code,
      req.status,
      req.fiat_disbursement_status,
      req.disbursed_at ? new Date(req.disbursed_at).toLocaleString() : "N/A",
      req.payout_reference || "N/A",
      new Date(req.created_at).toLocaleString(),
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `offramp-requests-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openRequestDetails = (request: OfframpRequest) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const getRequestStats = () => {
    const total = requests.length
    const pending = requests.filter((req) => req.fiat_disbursement_status === "pending").length
    const disbursed = requests.filter((req) => req.fiat_disbursement_status === "disbursed").length
    const failed = requests.filter((req) => req.fiat_disbursement_status === "failed").length

    return { total, pending, disbursed, failed }
  }

  const stats = getRequestStats()

  return (
    <Layout>
      <div className="relative min-h-screen bg-white dark:bg-background py-6 px-4 sm:px-6 lg:px-8">
        <BackgroundElements />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  Offramp Requests
                </h1>
                <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                  Manage and process user offramp requests
                </p>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-background/50 backdrop-blur-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Waitlist Management
                </button>
                <button
                  onClick={() => router.push("/admin/offramp")}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-background/50 backdrop-blur-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Off-Ramp Management
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
                <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
                <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Pending
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
                <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Disbursed
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.disbursed}
                </p>
              </div>
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
                <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {stats.failed}
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-black/50 dark:text-white/50" />
                </div>
                <input
                  type="search"
                  placeholder="Search requests..."
                  className="pl-10 w-full py-2 px-3 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-black/30 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative">
                  <button
                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full md:w-auto"
                  >
                    <Filter size={16} />
                    Filter
                    {filterMenuOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {filterMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-background rounded-md shadow-lg z-10 border border-black/10 dark:border-white/10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setStatusFilter("all")
                            setFilterMenuOpen(false)
                          }}
                          className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                        >
                          All Requests
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter("pending_all")
                            setFilterMenuOpen(false)
                          }}
                          className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                        >
                          All Pending
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter("pending")
                            setFilterMenuOpen(false)
                          }}
                          className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                        >
                          Pending Status
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter("confirmed")
                            setFilterMenuOpen(false)
                          }}
                          className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                        >
                          Confirmed Status
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter("failed")
                            setFilterMenuOpen(false)
                          }}
                          className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                        >
                          Failed Status
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter("disbursed")
                            setFilterMenuOpen(false)
                          }}
                          className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                        >
                          Disbursed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={exportToCSV}
                  className="md:flex hidden items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Download size={16} /> Export
                </button>
                <button
                  onClick={fetchOfframpRequests}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button
                  onClick={exportToCSV}
                  className="md:hidden flex items-center p-2 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex border-b border-black/10 dark:border-white/10 mb-6">
              <button
                onClick={() => setActiveView("table")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeView === "table"
                    ? "border-b-2 border-[#7b77b9] text-[#7b77b9] dark:text-[#a5a1ff]"
                    : "text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setActiveView("cards")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeView === "cards"
                    ? "border-b-2 border-[#7b77b9] text-[#7b77b9] dark:text-[#a5a1ff]"
                    : "text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white"
                }`}
              >
                Card View
              </button>
            </div>

            {/* Table View */}
            {activeView === "table" && (
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col space-y-3">
                        <div className="h-4 bg-black/10 dark:bg-white/10 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-black/10 dark:bg-white/10 rounded animate-pulse w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-black/40 dark:text-white/40 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-black dark:text-white">No requests found</h3>
                    <p className="text-black/70 dark:text-white/70 mt-1">
                      {requests.length > 0
                        ? "Try adjusting your search or filter criteria"
                        : "No offramp requests available at the moment"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
                      <thead className="bg-black/5 dark:bg-white/5">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider"
                          >
                            Conversion
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider"
                          >
                            Bank Details
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider"
                          >
                            Disbursement
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-transparent divide-y divide-black/10 dark:divide-white/10">
                        {filteredRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm font-medium text-black dark:text-white">{request.user_name}</div>
                                <div className="text-sm text-black/70 dark:text-white/70">{request.user_email}</div>
                                <div className="text-xs text-black/50 dark:text-white/50 mt-1 truncate max-w-[200px]">
                                  {request.user_wallet}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-sm text-black dark:text-white">
                                  {request.amount.toLocaleString()} {request.token}
                                </div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-black/40 dark:text-white/40"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                  />
                                </svg>
                                <div className="bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-sm text-black dark:text-white">
                                  {request.fiat_amount.toLocaleString()} {request.fiat_currency}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-black dark:text-white">{request.bank_name}</span>
                                <span className="text-sm text-black/70 dark:text-white/70">
                                  {request.bank_account_number} ({request.bank_code})
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1.5">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    request.status === "confirmed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : request.status === "pending"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  }`}
                                >
                                  {request.status === "confirmed" && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {request.status === "pending" && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {request.status === "failed" && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {request.status}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    request.fiat_disbursement_status === "disbursed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : request.fiat_disbursement_status === "pending"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  }`}
                                >
                                  {request.fiat_disbursement_status === "disbursed" && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {request.fiat_disbursement_status === "pending" && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {request.fiat_disbursement_status === "failed" && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {request.fiat_disbursement_status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-black dark:text-white">{formatDate(request.disbursed_at)}</div>
                              {request.payout_reference && (
                                <div className="text-xs text-black/60 dark:text-white/60">Ref: {request.payout_reference}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openRequestDetails(request)}
                                  className="inline-flex items-center px-3 py-1.5 border border-black/20 dark:border-white/20 text-sm font-medium rounded-lg text-black dark:text-white bg-white dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                  <Eye size={16} className="mr-1.5" />
                                  Details
                                </button>

                                {request.fiat_disbursement_status === "pending" && (
                                  <button
                                    onClick={() => openRequestDetails(request)}
                                    disabled={request.status !== "confirmed"}
                                    className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium ${
                                      request.status !== "confirmed"
                                        ? "border-black/20 dark:border-white/20 text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/5 cursor-not-allowed"
                                        : "border-[#7b77b9]/30 text-[#7b77b9] dark:text-[#a5a1ff] bg-[#7b77b9]/10 hover:bg-[#7b77b9]/20"
                                    } transition-colors`}
                                  >
                                    {request.status !== "confirmed" ? "Payout Disabled" : "Trigger Payout"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Card View */}
            {activeView === "cards" && (
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/2"></div>
                          <div className="h-20 bg-black/10 dark:bg-white/10 rounded"></div>
                          <div className="h-10 bg-black/10 dark:bg-white/10 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-black/40 dark:text-white/40 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-black dark:text-white">No requests found</h3>
                    <p className="text-black/70 dark:text-white/70 mt-1">
                      {requests.length > 0
                        ? "Try adjusting your search or filter criteria"
                        : "No offramp requests available at the moment"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-black dark:text-white">{request.user_name}</h3>
                              <p className="text-sm text-black/70 dark:text-white/70">{request.user_email}</p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.status === "confirmed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : request.status === "pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {request.status === "confirmed" && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {request.status === "pending" && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {request.status === "failed" && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {request.status}
                            </span>
                          </div>
                        </div>

                        <div className="px-4 py-3 space-y-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-black/60 dark:text-white/60">Token Amount</span>
                              <span className="font-medium text-black dark:text-white">
                                {request.amount.toLocaleString()} {request.token}
                              </span>
                            </div>
                            <div className="flex justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-black/40 dark:text-white/40 rotate-90 md:rotate-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                />
                              </svg>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-black/60 dark:text-white/60">Fiat Amount</span>
                              <span className="font-medium text-black dark:text-white">
                                {request.fiat_amount.toLocaleString()} {request.fiat_currency}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                              <p className="text-xs text-black/60 dark:text-white/60">Bank</p>
                              <p className="font-medium truncate text-black dark:text-white">{request.bank_name}</p>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                              <p className="text-xs text-black/60 dark:text-white/60">Account</p>
                              <p className="font-medium truncate text-black dark:text-white">{request.bank_account_number}</p>
                            </div>
                          </div>

                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-black/60 dark:text-white/60">Disbursement Status</p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  request.fiat_disbursement_status === "disbursed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : request.fiat_disbursement_status === "pending"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                              >
                                {request.fiat_disbursement_status === "disbursed" && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                {request.fiat_disbursement_status === "pending" && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                {request.fiat_disbursement_status === "failed" && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                {request.fiat_disbursement_status}
                              </span>
                            </div>
                            <p className="text-xs mt-1">{formatDate(request.disbursed_at)}</p>
                          </div>
                        </div>

                        <div className="px-4 pb-4 pt-2 flex justify-between">
                          <button
                            onClick={() => openRequestDetails(request)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            View Details
                          </button>

                          {request.fiat_disbursement_status === "pending" && (
                            <button
                              onClick={() => openRequestDetails(request)}
                              disabled={request.status !== "confirmed"}
                              className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium ${
                                request.status !== "confirmed"
                                  ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                                  : "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                              } transition-colors`}
                            >
                              {request.status !== "confirmed" ? "Awaiting Confirmation" : "Trigger Payout"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Dialog */}
      {isDialogOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setIsDialogOpen(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-background/95 backdrop-blur-lg rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-transparent px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-black dark:text-white">Request Details</h3>
                    <p className="mt-1 text-sm text-black/70 dark:text-white/70">Complete information about this offramp request</p>

                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">User</h4>
                          <p className="font-medium text-black dark:text-white">{selectedRequest.user_name}</p>
                          <p className="text-sm text-black/70 dark:text-white/70">{selectedRequest.user_email}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Status</h4>
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                selectedRequest.status === "confirmed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : selectedRequest.status === "pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {selectedRequest.status === "confirmed" && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {selectedRequest.status}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                selectedRequest.fiat_disbursement_status === "disbursed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : selectedRequest.fiat_disbursement_status === "pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {selectedRequest.fiat_disbursement_status === "disbursed" && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              {selectedRequest.fiat_disbursement_status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Wallet Address</h4>
                        <p className="text-sm font-mono break-all text-black dark:text-white">{selectedRequest.user_wallet}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Token Amount</h4>
                          <p className="font-medium text-black dark:text-white">
                            {selectedRequest.amount.toLocaleString()} {selectedRequest.token}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Fiat Amount</h4>
                          <p className="font-medium text-black dark:text-white">
                            {selectedRequest.fiat_amount.toLocaleString()} {selectedRequest.fiat_currency}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Bank Details</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Bank Name</p>
                            <p className="font-medium text-black dark:text-white">{selectedRequest.bank_name}</p>
                          </div>
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Bank Code</p>
                            <p className="font-medium text-black dark:text-white">{selectedRequest.bank_code}</p>
                          </div>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md mt-2">
                          <p className="text-xs text-black/60 dark:text-white/60">Account Number</p>
                          <p className="font-medium text-black dark:text-white">{selectedRequest.bank_account_number}</p>
                        </div>
                      </div>

                      {selectedRequest.payout_reference && (
                        <div>
                          <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Payout Reference</h4>
                          <p className="text-sm font-mono text-black dark:text-white">{selectedRequest.payout_reference}</p>
                        </div>
                      )}

                      {selectedRequest.admin_note && (
                        <div>
                          <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Admin Note</h4>
                          <p className="text-sm text-black dark:text-white">{selectedRequest.admin_note}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">Timestamps</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Created</p>
                            <p className="text-sm text-black dark:text-white">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                          </div>
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Disbursed</p>
                            <p className="text-sm text-black dark:text-white">
                              {selectedRequest.disbursed_at
                                ? new Date(selectedRequest.disbursed_at).toLocaleString()
                                : "Not yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-black/5 dark:bg-white/5 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedRequest.fiat_disbursement_status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleTriggerPayout(selectedRequest.id)}
                    disabled={selectedRequest.status !== "confirmed" || loading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${
                      selectedRequest.status !== "confirmed" || loading
                        ? "bg-[#7b77b9]/50 text-white/70 cursor-not-allowed"
                        : "bg-[#7b77b9] text-white hover:bg-[#7b77b9]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b77b9]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Trigger Payout"
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-black/20 dark:border-white/20 shadow-sm px-4 py-2 bg-white dark:bg-background text-base font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b77b9] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
