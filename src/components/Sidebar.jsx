import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserCheck } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "online"

  useEffect(() => {
    getUsers();
  }, [getUsers]);

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

  if (isUsersLoading) return <SidebarSkeleton />;

  const onlineCount = Math.max(0, onlineUsers.length - 1);

  return (
    <aside className="h-full w-16 lg:w-64 border-r border-base-300/60 flex flex-col transition-all duration-200 bg-base-100/30 backdrop-blur-md">
      {/* Header / Tabs */}
      <div className="p-3 border-b border-base-300/60 flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 hidden lg:block px-1">
          Chats
        </p>

        {/* Minimal Pill Selector */}
        <div className="hidden lg:flex p-0.5 bg-base-200/60 rounded-xl border border-base-300/20">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 press
              ${activeTab === "all"
                ? "bg-base-100 text-base-content shadow-sm border border-base-300/20"
                : "text-base-content/50 hover:text-base-content"
              }`}
          >
            <Users className="size-3" />
            <span>All</span>
            <span className="text-[9px] opacity-60 font-mono">({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("online")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 press
              ${activeTab === "online"
                ? "bg-base-100 text-emerald-500 shadow-sm border border-base-300/20"
                : "text-base-content/50 hover:text-emerald-500"
              }`}
          >
            <UserCheck className="size-3" />
            <span>Active</span>
            {onlineCount > 0 && (
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            )}
          </button>
        </div>

        {/* Small collapsed indicator for mobile */}
        <div className="lg:hidden flex justify-center py-1">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto flex-1 py-2 space-y-1">
        {filteredUsers.map((user) => {
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

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/30 text-xs py-8 px-4 leading-relaxed hidden lg:block">
            {activeTab === "online" ? "No contacts are active" : "Your contact list is empty"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
