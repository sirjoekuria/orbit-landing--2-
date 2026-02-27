const fs = require('fs');

const targetFile = 'client/pages/Admin.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const startMarker = `  return (
    <div className="min-h-screen bg-gray-50">`;

const endMarker = `            {/* Messages Tab */}`;

if (!content.includes(startMarker)) {
    console.error("Could not find start marker");
    process.exit(1);
}

if (!content.includes(endMarker)) {
    console.error("Could not find end marker");
    process.exit(1);
}

const replacement = `  return (
    <div className="min-h-screen bg-[#0a110d]">
      {/* Header */}
      <header className="hidden lg:block bg-[#0a110d] border-b border-[#ffffff05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-[#112417] hover:bg-[#152e1d] text-white font-bold px-4 py-2 rounded-xl border border-[#ffffff05] transition-all"
            >
              <LogOut className="w-4 h-4 text-[#eab308]" />
              <span className="uppercase text-xs tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-73px)] lg:h-screen">

      {/* Sidebar */}
      <div
        className={\`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a110d] shadow-2xl transform flex flex-col justify-between \${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-[#ffffff05]\`}
      >
        <div className="flex items-center justify-between pt-10 pb-6 px-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#0a110d] rounded-full flex items-center justify-center border border-[#eab308]/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <span className="text-[#eab308] font-bold text-sm">RC</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white leading-tight">
                Admin Panel
              </h2>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#8b9d93] font-bold mt-1">
                Nairobi Logistics
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-[#eab308]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 px-6 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Overview */}
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={\`w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-left transition-all mb-6 \${activeTab === "overview"
              ? "bg-[#112417] text-white shadow-[0_0_15px_rgba(234,179,8,0.05)] border border-[#eab308]/20"
              : "text-[#8b9d93] hover:bg-[#112417]/50 hover:text-white"
              }\`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={\`w-5 h-5 \${activeTab === "overview" ? "text-[#eab308]" : "text-[#eab308]/70"}\`}>
              <rect width="8" height="8" x="3" y="3" rx="1.5" />
              <rect width="8" height="8" x="13" y="3" rx="1.5" />
              <rect width="8" height="8" x="13" y="13" rx="1.5" />
              <rect width="8" height="8" x="3" y="13" rx="1.5" />
            </svg>
            <span className="font-bold text-sm tracking-wide">Dashboard Overview</span>
          </button>

          {/* Operations Menu */}
          <div className="mb-6">
            <button
              onClick={() =>
                setExpandedMenus((prev) => ({
                  ...prev,
                  operations: !prev.operations,
                }))
              }
              className="w-full flex items-center justify-between px-2 py-2 text-white hover:text-[#eab308] rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5 text-[#eab308]">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="font-bold text-sm tracking-wide">Operations</span>
              </div>
              {expandedMenus.operations ? (
                <ChevronDown className="w-4 h-4 text-[#eab308]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#eab308]" />
              )}
            </button>
            {expandedMenus.operations && (
              <div className="ml-[18px] pl-5 mt-4 space-y-5">
                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "orders"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "orders" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  {stats.pendingOrders > 0 ? (
                    <PendingBookingDot>Orders Management</PendingBookingDot>
                  ) : (
                    "Orders Management"
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("messages");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "messages"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "messages" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  {stats.unreadMessages > 0 ? (
                    <UnreadMessageDot>Customer Messages</UnreadMessageDot>
                  ) : (
                    "Customer Messages"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* People Management Menu */}
          <div className="mb-6">
            <button
              onClick={() =>
                setExpandedMenus((prev) => ({ ...prev, people: !prev.people }))
              }
              className="w-full flex items-center justify-between px-2 py-2 text-white hover:text-[#eab308] rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-[#eab308]" />
                <span className="font-bold text-sm tracking-wide">People</span>
              </div>
              {expandedMenus.people ? (
                <ChevronDown className="w-4 h-4 text-[#eab308]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#eab308]" />
              )}
            </button>
            {expandedMenus.people && (
              <div className="ml-[18px] pl-5 mt-4 space-y-5">
                <button
                  onClick={() => {
                    setActiveTab("users");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "users"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "users" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  Customer Users
                </button>
                <button
                  onClick={() => {
                    setActiveTab("riders");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "riders"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "riders" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  Rider Management
                </button>
                <button
                  onClick={() => {
                    setActiveTab("partnerships");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "partnerships"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "partnerships" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  Business Partners
                </button>
              </div>
            )}
          </div>

          {/* Financial Menu */}
          <div className="mb-6">
            <button
              onClick={() =>
                setExpandedMenus((prev) => ({
                  ...prev,
                  financial: !prev.financial,
                }))
              }
              className="w-full flex items-center justify-between px-2 py-2 text-white hover:text-[#eab308] rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#eab308]">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
                <span className="font-bold text-sm tracking-wide">Financial</span>
              </div>
              {expandedMenus.financial ? (
                <ChevronDown className="w-4 h-4 text-[#eab308]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#eab308]" />
              )}
            </button>
            {expandedMenus.financial && (
              <div className="ml-[18px] pl-5 mt-4 space-y-5">
                <button
                  onClick={() => {
                    setActiveTab("rider-earnings");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "rider-earnings"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "rider-earnings" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  Rider Earnings
                </button>
                <button
                  onClick={() => {
                    setActiveTab("rider-activity");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "rider-activity"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "rider-activity" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  Rider Activity Log
                </button>
                <button
                  onClick={() => {
                    setActiveTab("withdrawal-requests");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "withdrawal-requests"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "withdrawal-requests" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  Withdrawal Requests
                </button>
                <button
                  onClick={() => {
                    setActiveTab("automated-payments");
                    setSidebarOpen(false);
                  }}
                  className={\`w-full flex items-center text-left text-sm transition-colors tracking-wide \${activeTab === "automated-payments"
                    ? "text-white font-semibold"
                    : "text-[#8b9d93] hover:text-[#c4d6cb]"
                    }\`}
                >
                  <div className={\`w-[5px] h-[5px] rounded-full mr-4 \${activeTab === "automated-payments" ? "bg-[#eab308]" : "bg-[#596960]"}\`} />
                  Automated Payments
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Logout Button - moved to bottom area within sidebar */}
        <div className="px-6 pb-8 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 bg-[#112417] hover:bg-[#152e1d] text-white font-bold px-4 py-4 rounded-xl transition-all border border-[#ffffff0a] shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
          >
            <LogOut className="w-5 h-5 text-[#eab308]" />
            <span className="tracking-widest uppercase text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#0a110d]">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#0a110d] border-b border-[#ffffff05]">
          <div className="flex items-center justify-between px-6 py-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#eab308] hover:text-[#c48a04]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Admin Panel
              </h1>
              <span className="text-[9px] uppercase tracking-widest text-[#eab308] font-bold mt-1">
                Dashboard
              </span>
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-[#0a110d] border-b border-[#ffffff05] sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white tracking-wide capitalize">
                {activeTab === "rider-earnings"
                  ? "Rider Earnings"
                  : activeTab === "rider-activity"
                    ? "Rider Activity Log"
                    : activeTab === "withdrawal-requests"
                      ? "Withdrawal Requests"
                      : activeTab === "automated-payments"
                        ? "Automated Payments"
                        : activeTab.replace("-", " ")}
              </h1>
              <div className="flex items-center space-x-3 bg-[#112417] px-4 py-2 rounded-full border border-white/5">
                <div className="w-2 h-2 bg-[#eab308] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse" />
                <span className="text-xs font-bold text-[#8b9d93] uppercase tracking-widest">
                  Live System Check
                </span>
                <span className="text-xs text-[#596960] border-l border-[#ffffff10] pl-3 ml-1">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <PullToRefresh onRefresh={loadData}>
          <div className="p-4 lg:p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <AnimatedPage>
                <div className="space-y-8">
                  {/* Stats Cards */}
                  {/* Dashboard Header */}
                  <div className="bg-[#112417] p-6 lg:p-8 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_40px_rgba(0,0,0,0.3)] mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#eab308]/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center relative z-10 gap-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-wide mb-2">Dashboard Overview</h2>
                        <p className="text-[#8b9d93] text-sm">Real-time summary of Nairobi Logistics performance</p>
                      </div>
                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            await loadData();
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="flex items-center space-x-3 bg-[#eab308] hover:bg-[#ca8a04] text-black font-bold px-6 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] disabled:opacity-50 w-full sm:w-auto justify-center"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                        <span>{isLoading ? "Refreshing..." : "Refresh Dashboard"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isLoading ? (
                      <>
                        <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
                      </>
                    ) : (
                      <>
                        <div className="bg-[#112417] p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-400">
                              <Users className="h-7 w-7" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-xs font-bold text-[#8b9d93] uppercase tracking-wider truncate mb-1">
                                  Total Users
                                </dt>
                                <dd className="text-3xl font-bold text-white">
                                  {stats.totalUsers}
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#112417] p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#eab308]/10 rounded-full blur-xl group-hover:bg-[#eab308]/20 transition-all pointer-events-none" />
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-14 h-14 bg-[#eab308]/10 rounded-full flex items-center justify-center border border-[#eab308]/20 text-[#eab308]">
                              <Package className="h-7 w-7" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-xs font-bold text-[#8b9d93] uppercase tracking-wider truncate mb-1">
                                  Total Orders
                                </dt>
                                <dd className="text-3xl font-bold text-white">
                                  {stats.totalOrders}
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#112417] p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all pointer-events-none" />
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 text-green-400">
                              <MessageSquare className="h-7 w-7" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-xs font-bold text-[#8b9d93] uppercase tracking-wider truncate mb-1">
                                  New Messages
                                </dt>
                                <dd className="text-3xl font-bold text-white">
                                  {stats.unreadMessages}
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#112417] p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 text-purple-400">
                              <TrendingUp className="h-7 w-7" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-xs font-bold text-[#8b9d93] uppercase tracking-wider truncate mb-1">
                                  Total Revenue
                                </dt>
                                <dd className="text-xl font-bold text-white">
                                  KES {stats.totalRevenue.toLocaleString()}
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-[#112417] rounded-[24px] border border-[#ffffff05] overflow-hidden">
                      <div className="px-8 py-6 border-b border-[#ffffff0a] flex justify-between items-center bg-[#152a1d]">
                        <h3 className="text-lg font-bold text-white tracking-wide">
                          Recent Orders
                        </h3>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-sm text-[#eab308] hover:text-white font-bold tracking-wider uppercase transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="p-4 lg:p-6">
                        <div className="space-y-3">
                          {isLoading ? (
                            <div className="space-y-4">
                              <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                              <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                              <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                            </div>
                          ) : orders.length === 0 ? (
                            <div className="py-12 text-center">
                              <Package className="w-12 h-12 text-[#3a4f41] mx-auto mb-3" />
                              <p className="text-sm font-bold text-[#8b9d93]">No recent orders</p>
                            </div>
                          ) : (
                            orders.slice(0, 5).map((order) => (
                              <div
                                key={order.id}
                                className="flex items-center justify-between p-4 bg-[#0a110d]/50 hover:bg-[#0a110d] rounded-xl border border-[#ffffff05] transition-all"
                              >
                                <div>
                                  <p className="text-sm font-bold text-white mb-1">
                                    {order.id}
                                  </p>
                                  <p className="text-sm text-[#8b9d93]">
                                    {order.customerName}
                                  </p>
                                  <p className="text-xs text-[#596960] mt-1 font-mono">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {formatDate(order.timestamp)}
                                  </p>
                                </div>
                                <span
                                  className={\`px-3 py-1.5 text-xs font-bold rounded-full border \${
                                    order.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                    order.status === "confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    order.status === "picked_up" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                    order.status === "in_transit" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                    order.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                                  }\`}
                                >
                                  {order.status.replace("_", " ")}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#112417] rounded-[24px] border border-[#ffffff05] overflow-hidden">
                      <div className="px-8 py-6 border-b border-[#ffffff0a] flex justify-between items-center bg-[#152a1d]">
                        <h3 className="text-lg font-bold text-white tracking-wide">
                          Recent Messages
                        </h3>
                        <button
                          onClick={() => setActiveTab("messages")}
                          className="text-sm text-[#eab308] hover:text-white font-bold tracking-wider uppercase transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="p-4 lg:p-6">
                        <div className="space-y-3">
                          {isLoading ? (
                            <div className="space-y-4">
                              <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                              <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                              <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="py-12 text-center">
                              <MessageSquare className="w-12 h-12 text-[#3a4f41] mx-auto mb-3" />
                              <p className="text-sm font-bold text-[#8b9d93]">No recent messages</p>
                            </div>
                          ) : (
                            messages.slice(0, 5).map((message) => (
                              <div
                                key={message.id}
                                className="flex items-center justify-between p-4 bg-[#0a110d]/50 hover:bg-[#0a110d] rounded-xl border border-[#ffffff05] transition-all"
                              >
                                <div>
                                  <p className="text-sm font-bold text-white mb-1">
                                    {message.name}
                                  </p>
                                  <p className="text-sm text-[#eab308]">
                                    {message.subject}
                                  </p>
                                  <p className="text-xs text-[#596960] mt-1 font-mono">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {formatDate(message.timestamp)}
                                  </p>
                                </div>
                                <span
                                  className={\`px-3 py-1.5 text-xs font-bold rounded-full border \${
                                    message.status === "new" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    message.status === "replied" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                  }\`}
                                >
                                  {message.status}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedPage>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <AnimatedPage>
                <div className="space-y-8">
                  {/* Search and Filter */}
                  <div className="flex flex-col gap-6">
                    <div className="flex lg:hidden items-center justify-between">
                       <h2 className="text-3xl font-bold text-white">Order<br/>Management</h2>
                       <button
                         onClick={async () => {
                           setIsLoading(true);
                           try {
                             await fetchOrders(1);
                           } finally {
                             setIsLoading(false);
                           }
                         }}
                         disabled={isLoading}
                         className="flex items-center space-x-2 bg-[#eab308] text-black font-bold px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:opacity-50"
                       >
                         {isLoading ? (
                           <RefreshCw className="w-4 h-4 animate-spin" />
                         ) : (
                           <RefreshCw className="w-4 h-4" />
                         )}
                         <span className="text-sm">Refresh</span>
                       </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#eab308]" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border border-[#eab308]/30 text-white placeholder:text-[#3a4f41] rounded-[16px] pl-12 pr-4 py-4 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
                      />
                    </div>
                    
                    <div className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
                      <div className="relative min-w-[120px]">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full appearance-none bg-[#112417] border border-[#eab308]/30 text-[#eab308] font-bold rounded-full px-5 py-2 pr-10 focus:outline-none focus:border-[#eab308]"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#eab308] pointer-events-none" />
                      </div>
                      <button className="whitespace-nowrap bg-[#0a110d] border border-[#ffffff10] text-white font-bold rounded-full px-5 py-2 hover:bg-[#112417]">
                        Today
                      </button>
                      <button className="whitespace-nowrap bg-[#0a110d] border border-[#ffffff10] text-white font-bold rounded-full px-5 py-2 hover:bg-[#112417]">
                        Completed
                      </button>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-4">
                    {isLoading ? (
                      <CardSkeleton />
                    ) : filteredOrders.length === 0 ? (
                      <div className="bg-[#112417] rounded-[24px] border border-transparent p-12 text-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#eab308]/5 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="w-24 h-24 bg-[#eab308] rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(234,179,8,0.2)] relative z-10 border-4 border-[#112417] outline outline-1 outline-[#eab308]/20">
                          <Package className="w-12 h-12 text-black" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 relative z-10">
                          No orders found
                        </h3>
                        <p className="text-[#8b9d93] max-w-xs mx-auto mb-8 relative z-10 text-sm">
                          Try adjusting your search or filters to find what you're looking for.
                        </p>
                        
                        <button 
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                          }}
                          className="flex items-center space-x-2 mx-auto text-[#eab308] font-bold text-sm tracking-wide relative z-10 hover:text-white transition-colors"
                        >
                          <Filter className="w-4 h-4" />
                          <span>Reset Filters</span>
                        </button>
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-[#112417] rounded-[20px] shadow-lg border border-[#ffffff05] p-6 lg:p-8"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">
                                {order.id}
                              </h3>
                              <p className="text-[#8b9d93] font-medium">
                                {order.customerName} • <span className="text-[#eab308]">{order.customerPhone}</span>
                              </p>
                              <p className="text-xs text-[#596960] mt-2 font-mono">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Created: {formatDate(order.timestamp)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3 self-start">
                              <span
                                className={\`px-4 py-1.5 text-xs font-bold rounded-full border tracking-wide uppercase \${
                                  order.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                  order.status === "confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                  order.status === "picked_up" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                  order.status === "in_transit" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                  order.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                  "bg-red-500/10 text-red-400 border-red-500/20"
                                }\`}
                              >
                                {order.status.replace("_", " ")}
                              </span>
                              <div className="flex bg-[#0a110d] rounded-lg border border-[#ffffff05] overflow-hidden">
                                <button
                                  onClick={() =>
                                    setEditingOrder(
                                      editingOrder === order.id ? null : order.id,
                                    )
                                  }
                                  className="p-2.5 text-[#8b9d93] hover:text-[#eab308] hover:bg-white/5 transition-colors border-r border-[#ffffff05]"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteOrder(order.id)}
                                  className="p-2.5 text-red-500/70 hover:text-red-400 hover:bg-white/5 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 p-5 bg-[#0a110d]/50 rounded-xl border border-[#ffffff05]">
                            <div>
                              <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                Pickup
                              </p>
                              <p className="text-sm text-white font-medium">{order.pickup}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                Delivery
                              </p>
                              <p className="text-sm text-white font-medium">
                                {order.delivery}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                Cost
                              </p>
                              <p className="text-sm text-[#eab308] font-bold">
                                KES {order.cost} <span className="text-[#8b9d93] font-normal">({order.distance}km)</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                Status Updated
                              </p>
                              <p className="text-sm text-white font-mono">
                                {order.updatedAt
                                  ? formatDate(order.updatedAt)
                                  : "Not updated"}
                              </p>
                            </div>
                          </div>

                          {order.riderName && (
                            <div className="mb-6 p-4 bg-[#1a2b20] border border-green-500/20 rounded-xl flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                                <Bike className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-0.5">
                                  Assigned Rider
                                </p>
                                <p className="text-sm text-white font-medium">
                                  {order.riderName} • <span className="text-gray-400">{order.riderPhone}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          {order.notes && (
                            <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                              <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-2 flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1.5" /> Notes
                              </p>
                              <p className="text-sm text-yellow-100">{order.notes}</p>
                            </div>
                          )}

                          {/* Order Actions */}
                          {editingOrder === order.id ? (
                            <div className="border-t border-[#ffffff10] pt-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-xs font-bold text-[#8b9d93] uppercase tracking-wider mb-2">
                                    Update Status
                                  </label>
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      updateOrderStatus(
                                        order.id,
                                        e.target.value as Order["status"],
                                      )
                                    }
                                    className="w-full bg-[#0a110d] border border-[#ffffff15] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="picked_up">Picked Up</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-[#8b9d93] uppercase tracking-wider mb-2">
                                    Assign Rider
                                  </label>
                                  {order.riderName ? (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                      <p className="text-sm font-bold text-green-400">
                                        {order.riderName}
                                      </p>
                                      <p className="text-xs text-green-300 mb-2">
                                        {order.riderPhone}
                                      </p>
                                      <button
                                        onClick={() => setAssigningRider(order.id)}
                                        className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1.5 rounded-lg font-bold transition-colors"
                                      >
                                        Change Rider
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setAssigningRider(order.id)}
                                      className="w-full p-4 border-2 border-dashed border-[#ffffff15] rounded-xl text-[#8b9d93] font-bold hover:border-[#eab308] hover:text-[#eab308] transition-colors"
                                    >
                                      + Assign Rider
                                    </button>
                                  )}

                                  {assigningRider === order.id && (
                                    <div className="mt-3 p-4 bg-[#0a110d] rounded-xl border border-[#ffffff10]">
                                      <label className="block text-xs font-bold text-[#eab308] mb-3">
                                        Select Available Rider:
                                      </label>
                                      <select
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            assignRiderToOrder(
                                              order.id,
                                              e.target.value,
                                            );
                                          }
                                        }}
                                        className="w-full bg-[#112417] border border-[#ffffff15] text-white rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[#eab308]"
                                        defaultValue=""
                                      >
                                        <option value="">Choose a rider...</option>
                                        {availableRiders.map((rider) => (
                                          <option key={rider.id} value={rider.id}>
                                            {rider.fullName} - {rider.area} ({rider.rating}★)
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={() => setAssigningRider(null)}
                                        className="mt-3 w-full text-xs font-bold text-[#8b9d93] hover:text-white bg-white/5 py-2 rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => setEditingOrder(null)}
                                className="w-full bg-[#eab308] text-black font-bold px-4 py-3 rounded-xl hover:bg-[#ca8a04] transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          ) : (
                            <div className="border-t border-[#ffffff10] pt-6 mt-2">
                              {/* Payment Confirmation Section */}
                              <div className="mb-6 p-5 bg-[#eab308]/5 border border-[#eab308]/20 rounded-xl relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-[#eab308]/10 rounded-full blur-2xl pointer-events-none" />
                                <h4 className="font-bold text-[#eab308] mb-3 flex items-center tracking-wide relative z-10">
                                  <DollarSign className="w-4 h-4 mr-2" /> Payment Management
                                </h4>
                                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                                  <button
                                    onClick={() =>
                                      confirmPaymentAndSendReceipt(order.id)
                                    }
                                    className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-3 rounded-xl hover:bg-green-500/30 text-sm font-bold flex items-center justify-center transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm Payment
                                  </button>
                                  <button
                                    onClick={() => resendReceipt(order.id)}
                                    className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-xl hover:bg-blue-500/30 text-sm font-bold flex items-center justify-center transition-colors"
                                  >
                                    <Mail className="w-4 h-4 mr-2" /> Resend Receipt
                                  </button>
                                </div>
                                <p className="text-[#8b9d93] text-xs mt-3 relative z-10">
                                  Receipts are linked to <strong>{order.customerEmail}</strong>
                                </p>
                              </div>

                              {/* Order Status Management */}
                              <div className="flex flex-wrap gap-3">
                                {order.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order.id, "confirmed")
                                    }
                                    className="flex-1 min-w-[140px] bg-blue-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-700 text-sm flex justify-center items-center shadow-lg"
                                  >
                                    Confirm Order
                                  </button>
                                )}
                                {order.status === "confirmed" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order.id, "picked_up")
                                    }
                                    className="flex-1 min-w-[140px] bg-purple-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-purple-700 text-sm flex justify-center items-center shadow-lg"
                                  >
                                    Mark Picked Up
                                  </button>
                                )}
                                {order.status === "picked_up" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order.id, "in_transit")
                                    }
                                    className="flex-1 min-w-[140px] bg-orange-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-orange-700 text-sm flex justify-center items-center shadow-lg"
                                  >
                                    In Transit
                                  </button>
                                )}
                                {order.status === "in_transit" && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order.id, "delivered")
                                    }
                                    className="flex-1 min-w-[140px] bg-green-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-green-700 text-sm flex justify-center items-center shadow-lg"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination Controls */}
                  <div className="mt-10 bg-[#112417] p-2 rounded-2xl border border-[#ffffff05] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between px-4 py-2">
                       <p className="text-sm font-bold text-[#8b9d93]">
                         Showing page <span className="text-white">{currentPage}</span> of{' '}
                         <span className="text-white">{totalPages}</span>
                       </p>
                       <div className="flex items-center space-x-2">
                          <button
                            onClick={() => fetchOrders(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border border-[#ffffff10] rounded-xl text-[#eab308] hover:bg-white/5 hover:border-[#eab308]/50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => fetchOrders(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-[#ffffff10] rounded-xl text-[#eab308] hover:bg-white/5 hover:border-[#eab308]/50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </AnimatedPage>
            )}

            {/* Messages Tab */}`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex + endMarker.length);
fs.writeFileSync(targetFile, newContent, 'utf8');
console.log("Successfully updated layout and orders tab!");
