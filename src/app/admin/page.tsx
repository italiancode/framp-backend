"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { BackgroundElements } from "@/components/ui/BackgroundElements";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Download,
  Search,
  Eye,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

type WaitlistEntry = {
  id: string;
  name: string | null;
  email: string;
  wallet: string | null;
  referral: string | null;
  status: "pending" | "confirmed";
  ip_address: string;
  created_at: string;
  user_agent?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([]);
  const [filteredData, setFilteredData] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<string>("table");
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Fetch waitlist data directly from Supabase
    const fetchWaitlistData = async () => {
      try {
        setIsLoading(true);

        let query = supabase.from("waitlist").select("*");

        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        // Apply search query if present
        if (searchQuery) {
          query = query.or(
            `email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,wallet.ilike.%${searchQuery}%`
          );
        }

        // Apply sorting
        query = query.order(sortField, { ascending: sortDirection === "asc" });

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setWaitlistData(data || []);
        setFilteredData(data || []);
      } catch (error) {
        console.error("Error fetching waitlist data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistData();
  }, [statusFilter, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEntries(filteredData.map((entry) => entry.id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleSelectEntry = (id: string) => {
    if (selectedEntries.includes(id)) {
      setSelectedEntries(selectedEntries.filter((entryId) => entryId !== id));
    } else {
      setSelectedEntries([...selectedEntries, id]);
    }
  };

  const handleStatusChange = async (entries: string[], newStatus: string) => {
    try {
      // Update status directly in Supabase
      const { error } = await supabase
        .from("waitlist")
        .update({ status: newStatus })
        .in("id", entries);

      if (error) {
        throw error;
      }

      // Update local state after successful update
      const updatedData = waitlistData.map((entry) =>
        entries.includes(entry.id)
          ? { ...entry, status: newStatus as "pending" | "confirmed" }
          : entry
      );

      setWaitlistData(updatedData);
      setSelectedEntries([]);
    } catch (error) {
      console.error("Error updating waitlist entries:", error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Wallet",
      "Referral",
      "Status",
      "IP Address",
      "Created At",
    ].join(",");

    const csvRows = filteredData.map((entry) => {
      return [
        entry.id,
        entry.name || "",
        entry.email,
        entry.wallet || "",
        entry.referral || "",
        entry.status,
        entry.ip_address,
        entry.created_at,
      ]
        .map((value) => `"${value}"`)
        .join(",");
    });

    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `waitlist_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      // Force a full page refresh when logging out
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-white dark:bg-background py-6 px-4 sm:px-6 lg:px-8">
        <BackgroundElements />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-black/70 dark:text-white/70 mt-1">
                Manage waitlist entries and platform operations
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
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Total Signups
              </p>
              <p className="text-2xl font-bold text-black dark:text-white mt-1">
                  {waitlistData.length}
              </p>
              </div>
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Confirmed Users
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {
                    waitlistData.filter((entry) => entry.status === "confirmed")
                      .length
                  }
              </p>
              </div>
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Pending Confirmation
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {
                    waitlistData.filter((entry) => entry.status === "pending")
                      .length
                  }
              </p>
                </div>
            <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-4">
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                Last Updated
              </p>
              <p className="text-lg font-bold text-black dark:text-white mt-1">
                {waitlistData.length > 0
                  ? formatDistanceToNow(new Date(waitlistData[0].created_at), {
                      addSuffix: true,
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="relative w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-black/50 dark:text-white/50" />
                  </div>
                  <input
                type="search"
                    placeholder="Search emails, names, wallets..."
                className="pl-10 w-full py-2 px-3 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-black/30 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                          setStatusFilter("all");
                          setFilterMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                      >
                        All Users
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("pending");
                          setFilterMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                      >
                        Pending Users
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("confirmed");
                          setFilterMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 w-full text-left"
                      >
                        Confirmed Users
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
                onClick={() => window.location.reload()}
                className="flex items-center p-2 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 md:hidden"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button
                  onClick={exportToCSV}
                className="md:hidden flex items-center p-2 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

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
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {selectedEntries.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-black/70 dark:text-white/70">
                    {selectedEntries.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 dark:text-green-400 border-green-300 flex items-center gap-2"
                    onClick={() =>
                      handleStatusChange(selectedEntries, "confirmed")
                    }
                  >
                    <CheckCircle size={16} /> Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-600 dark:text-amber-400 border-amber-300 flex items-center gap-2"
                    onClick={() =>
                      handleStatusChange(selectedEntries, "pending")
                    }
                  >
                    <XCircle size={16} /> Pending
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => window.location.reload()}
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#7b77b9] focus:ring-[#7b77b9]"
                        onChange={handleSelectAll}
                        checked={
                          selectedEntries.length === filteredData.length &&
                          filteredData.length > 0
                        }
                      />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("email")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Email</span>
                        {sortField === "email" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Name</span>
                        {sortField === "name" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider">
                      Wallet Address
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        {sortField === "status" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("created_at")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortField === "created_at" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black/70 dark:text-white/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-transparent divide-y divide-black/10 dark:divide-white/10">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-black/70 dark:text-white/70"
                      >
                        <div className="flex justify-center items-center">
                          <RefreshCw size={20} className="animate-spin mr-2" />
                          Loading waitlist data...
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-black/70 dark:text-white/70"
                      >
                        No waitlist entries found with the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#7b77b9] focus:ring-[#7b77b9]"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={() => handleSelectEntry(entry.id)}
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-black dark:text-white">
                          <div className="font-medium">{entry.email}</div>
                          <div className="text-xs text-black/50 dark:text-white/50">
                            {entry.ip_address}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-black dark:text-white">
                          {entry.name || (
                            <span className="text-black/40 dark:text-white/40">
                              Not provided
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-black dark:text-white">
                          {entry.wallet ? (
                            <div className="flex items-center gap-1">
                              <div className="max-w-[200px] truncate">
                                {entry.wallet}
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(entry.wallet || "")
                                }
                                className="text-black/50 dark:text-white/50 hover:text-[#7b77b9]"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-black/40 dark:text-white/40">
                              Not provided
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-black dark:text-white">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-4 py-4 text-sm text-black dark:text-white">
                          <div className="flex items-center gap-2">
                            {entry.status === "pending" ? (
                              <button
                                onClick={() =>
                                  handleStatusChange([entry.id], "confirmed")
                                }
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                                title="Confirm"
                              >
                                <CheckCircle size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleStatusChange([entry.id], "pending")
                                }
                                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                                title="Mark as Pending"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              className="text-black/60 dark:text-white/60 hover:text-[#7b77b9]"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-black/70 dark:text-white/70">
                  Showing {filteredData.length} of {waitlistData.length}{" "}
                  waitlist entries
                </div>
                <div className="flex items-center gap-2">
                  {/* Pagination could be added here in the future */}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Card View */}
          {activeView === "cards" && (
            <div>
              {isLoading ? (
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
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="h-10 w-10 text-black/40 dark:text-white/40 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
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
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white">No entries found</h3>
                  <p className="text-black/70 dark:text-white/70 mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredData.map((entry) => (
                    <div key={entry.id} className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-black dark:text-white">{entry.name || "No Name"}</h3>
                            <p className="text-sm text-black/70 dark:text-white/70">{entry.email}</p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                          >
                            {entry.status === "confirmed" && (
                              <CheckCircle size={12} className="mr-1" />
                            )}
                            {entry.status === "pending" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
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
                            {entry.status}
                          </span>
                        </div>
                      </div>

                      <div className="px-4 py-3 space-y-4">
                        {entry.wallet ? (
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Wallet Address</p>
                            <div className="flex items-center gap-1 mt-1">
                              <p className="text-sm font-mono truncate">{entry.wallet}</p>
                              <button
                                onClick={() => copyToClipboard(entry.wallet || "")}
                                className="text-black/50 dark:text-white/50 hover:text-[#7b77b9]"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Wallet Address</p>
                            <p className="text-sm text-black/40 dark:text-white/40">Not provided</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">IP Address</p>
                            <p className="text-sm truncate">{entry.ip_address}</p>
                          </div>
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Created</p>
                            <p className="text-sm truncate">{formatDate(entry.created_at)}</p>
                          </div>
                        </div>

                        {entry.referral && (
                          <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md">
                            <p className="text-xs text-black/60 dark:text-white/60">Referral</p>
                            <p className="text-sm truncate">{entry.referral}</p>
                          </div>
                        )}
                      </div>

                      <div className="px-4 pb-4 pt-2 flex justify-between">
                        <div className="flex gap-1">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#7b77b9] focus:ring-[#7b77b9]"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={() => handleSelectEntry(entry.id)}
                          />
                          <span className="text-xs text-black/60 dark:text-white/60 self-center ml-1">
                            Select
                          </span>
                        </div>
                        <div>
                          {entry.status === "pending" ? (
                            <button
                              onClick={() => handleStatusChange([entry.id], "confirmed")}
                              className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-lg text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange([entry.id], "pending")}
                              className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-sm font-medium rounded-lg text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                            >
                              Pending
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
