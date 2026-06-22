import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Ban,
  Check,
  Search,
  Send,
  ShieldOff,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const Sidebar = () => {
  const {
    getFriendState,
    searchUsersByName,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    blockUser,
    unblockUser,
    users,
    searchResults,
    sentRequests,
    receivedRequests,
    blockedUsers,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    isFriendsLoading,
    isSearchingUsers,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getFriendState();
  }, [getFriendState]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === "search") searchUsersByName(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeTab, searchTerm, searchUsersByName]);

  const filteredUsers = (
    activeTab === "online"
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users
  ).slice().sort((a, b) => {
    const aOnline = onlineUsers.includes(a._id);
    const bOnline = onlineUsers.includes(b._id);
    if (aOnline === bOnline) return 0;
    return aOnline ? -1 : 1;
  });

  if (isUsersLoading || isFriendsLoading) return <SidebarSkeleton />;

  const requestCount = receivedRequests.length;

  const tabs = [
    { id: "friends", label: "Friends", icon: Users, count: users.length },
    { id: "search", label: "Search", icon: Search },
    { id: "requests", label: "Requests", icon: UserPlus, count: requestCount },
    { id: "blocked", label: "Blocked", icon: Ban, count: blockedUsers.length },
  ];

  const renderUserIdentity = (user, subtitle) => (
    <>
      <div className="relative flex-shrink-0 mx-auto lg:mx-0">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.fullName}
          className="size-9 object-cover rounded-full ring-1 ring-base-300/30"
        />
        {onlineUsers.includes(user._id) && (
          <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100 pulse-dot" />
        )}
      </div>
      <div className="hidden lg:block min-w-0 flex-1">
        <p className="text-sm truncate font-medium">{user.fullName}</p>
        <p className="text-[10px] truncate text-base-content/40">{subtitle}</p>
      </div>
    </>
  );

  const renderRelationshipButton = (user) => {
    if (user.relationship === "friends") {
      return (
        <span className="hidden lg:inline text-[10px] text-base-content/40">Friend</span>
      );
    }
    if (user.relationship === "request_sent") {
      return <Send className="size-4 text-base-content/35" />;
    }
    if (user.relationship === "request_received") {
      return (
        <button
          onClick={() => acceptFriendRequest(user._id)}
          className="p-1.5 rounded-lg text-success hover:bg-success/10 press"
          title="Accept request"
        >
          <Check className="size-4" />
        </button>
      );
    }
    if (user.relationship === "blocked") {
      return (
        <button
          onClick={() => unblockUser(user._id)}
          className="p-1.5 rounded-lg text-base-content/50 hover:bg-base-200 press"
          title="Unblock"
        >
          <ShieldOff className="size-4" />
        </button>
      );
    }

    return (
      <button
        onClick={() => sendFriendRequest(user._id)}
        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 press"
        title="Send friend request"
      >
        <UserPlus className="size-4" />
      </button>
    );
  };

  return (
    <aside className="h-full w-16 lg:w-64 border-r border-base-300/60 flex flex-col transition-all duration-200 bg-base-100/30 backdrop-blur-md">
      {/* Header / Tabs */}
      <div className="p-3 border-b border-base-300/60 flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 hidden lg:block px-1">
          Chats
        </p>

        <div className="hidden lg:grid grid-cols-4 gap-1 p-0.5 bg-base-200/60 rounded-xl border border-base-300/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg font-medium transition-all duration-150 press
                  ${activeTab === tab.id
                    ? "bg-base-100 text-base-content shadow-sm border border-base-300/20"
                    : "text-base-content/50 hover:text-base-content"
                  }`}
                title={tab.label}
              >
                <Icon className="size-3.5" />
                {tab.count > 0 && (
                  <span className="text-[9px] opacity-60 font-mono">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Small collapsed indicator for mobile */}
        <div className="lg:hidden flex justify-center py-1">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto flex-1 py-2 space-y-1">
        {activeTab === "search" && (
          <div className="hidden lg:block px-3 pb-2">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/35" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search full name"
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-base-200/70 border border-base-300/40 text-sm outline-none focus:border-primary/40"
              />
            </label>
          </div>
        )}

        {(activeTab === "friends" || activeTab === "online") && filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-[calc(100%-16px)] px-3 py-2 flex items-center gap-3 transition-all duration-150 press rounded-xl mx-2 text-left group
                ${isSelected
                  ? "bg-primary/8 text-primary font-medium"
                  : "text-base-content/75 hover:bg-base-200/50 hover:text-base-content"
                }`}
            >
              {/* Avatar Container */}
              <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className={`size-9 object-cover rounded-full transition-transform duration-150 group-hover:scale-105
                    ${isSelected ? "ring-2 ring-primary/30" : "ring-1 ring-base-300/30"}`}
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100 pulse-dot" />
                )}
              </div>

              {/* User details — desktop only */}
              <div className="hidden lg:block min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${isSelected ? "text-primary font-semibold" : ""}`}>
                    {user.fullName}
                  </p>
                </div>
                <p className={`text-[10px] truncate ${isOnline ? "text-emerald-500 font-medium" : "text-base-content/40"}`}>
                  {isOnline ? "Active now" : "Offline"}
                </p>
              </div>
            </button>
          );
        })}

        {activeTab === "search" && (
          <div className="space-y-1">
            {isSearchingUsers && (
              <p className="hidden lg:block text-center text-xs text-base-content/35 py-6">
                Searching...
              </p>
            )}
            {!isSearchingUsers && searchResults.map((user) => (
              <div
                key={user._id}
                className="w-[calc(100%-16px)] px-3 py-2 flex items-center gap-3 rounded-xl mx-2 text-left text-base-content/75 hover:bg-base-200/50"
              >
                {renderUserIdentity(user, user.email)}
                <div className="hidden lg:flex items-center gap-1">
                  {renderRelationshipButton(user)}
                  {user.relationship !== "blocked" && (
                    <button
                      onClick={() => blockUser(user._id)}
                      className="p-1.5 rounded-lg text-base-content/35 hover:text-error hover:bg-error/10 press"
                      title="Block"
                    >
                      <Ban className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-1">
            {receivedRequests.map((user) => (
              <div
                key={user._id}
                className="w-[calc(100%-16px)] px-3 py-2 flex items-center gap-3 rounded-xl mx-2 text-left text-base-content/75 hover:bg-base-200/50"
              >
                {renderUserIdentity(user, "Wants to connect")}
                <div className="hidden lg:flex items-center gap-1">
                  <button
                    onClick={() => acceptFriendRequest(user._id)}
                    className="p-1.5 rounded-lg text-success hover:bg-success/10 press"
                    title="Accept request"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    onClick={() => declineFriendRequest(user._id)}
                    className="p-1.5 rounded-lg text-base-content/40 hover:text-error hover:bg-error/10 press"
                    title="Decline request"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            {sentRequests.map((user) => (
              <div
                key={user._id}
                className="w-[calc(100%-16px)] px-3 py-2 flex items-center gap-3 rounded-xl mx-2 text-left text-base-content/55"
              >
                {renderUserIdentity(user, "Request sent")}
                <Send className="hidden lg:block size-4 text-base-content/35" />
              </div>
            ))}
          </div>
        )}

        {activeTab === "blocked" && (
          <div className="space-y-1">
            {blockedUsers.map((user) => (
              <div
                key={user._id}
                className="w-[calc(100%-16px)] px-3 py-2 flex items-center gap-3 rounded-xl mx-2 text-left text-base-content/75 hover:bg-base-200/50"
              >
                {renderUserIdentity(user, "Blocked")}
                <button
                  onClick={() => unblockUser(user._id)}
                  className="hidden lg:block p-1.5 rounded-lg text-primary hover:bg-primary/10 press"
                  title="Unblock"
                >
                  <ShieldOff className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab !== "search" && activeTab !== "requests" && activeTab !== "blocked" && filteredUsers.length === 0 && (
          <div className="text-center text-base-content/30 text-xs py-8 px-4 leading-relaxed hidden lg:block">
            {activeTab === "online" ? "No contacts are active" : "Your contact list is empty"}
          </div>
        )}
        {activeTab === "search" && searchTerm.trim().length >= 2 && !isSearchingUsers && searchResults.length === 0 && (
          <div className="text-center text-base-content/30 text-xs py-8 px-4 leading-relaxed hidden lg:block">
            No users found
          </div>
        )}
        {activeTab === "requests" && receivedRequests.length + sentRequests.length === 0 && (
          <div className="text-center text-base-content/30 text-xs py-8 px-4 leading-relaxed hidden lg:block">
            No pending requests
          </div>
        )}
        {activeTab === "blocked" && blockedUsers.length === 0 && (
          <div className="text-center text-base-content/30 text-xs py-8 px-4 leading-relaxed hidden lg:block">
            No blocked users
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
