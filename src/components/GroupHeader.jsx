import { useState } from "react";
import {
  X,
  Users,
  UserPlus,
  UserMinus,
  Trash2,
  Crown,
  LogOut,
  UserCheck,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ConfirmationModal from "./ConfirmationModal";

const GroupHeader = () => {
  const {
    selectedGroup,
    selectGroup,
    leaveGroup,
    deleteGroup,
    removeGroupMember,
    addGroupMember,
  } = useGroupStore();

  const { users: friends, sentRequests, sendFriendRequest } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  if (!selectedGroup) return null;

  const members = selectedGroup.members || [];
  const adminId =
    typeof selectedGroup.admin === "object"
      ? selectedGroup.admin?._id
      : selectedGroup.admin;
  const isAdmin = authUser._id === adminId;

  // Friends not yet in the group
  const memberIds = new Set(
    members.map((m) => (typeof m === "object" ? m._id : m))
  );
  const friendsNotInGroup = friends.filter((f) => !memberIds.has(f._id));

  // Relationship helpers
  const isFriend = (memberId) => friends.some((f) => f._id === memberId);
  const hasSentRequest = (memberId) =>
    sentRequests.some((u) => u._id === memberId);

  const handleClose = () => selectGroup(null);

  const handleLeave = async () => {
    setIsLeaveModalOpen(false);
    await leaveGroup(selectedGroup._id);
  };

  const handleDelete = async () => {
    setIsDeleteModalOpen(false);
    await deleteGroup(selectedGroup._id);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemoveModalOpen(false);
    await removeGroupMember(selectedGroup._id, memberToRemove._id);
    setMemberToRemove(null);
  };

  return (
    <>
      {/* Header bar */}
      <div className="px-3 sm:px-4 py-3 border-b border-base-300/60 flex items-center justify-between gap-2 bg-transparent">
        {/* Left: group info */}
        <button
          onClick={() => setIsMembersOpen(true)}
          className="flex items-center gap-3 min-w-0 text-left rounded-xl pr-3 py-1 hover:bg-base-200/50 transition-all duration-150 press"
          title="View members"
        >
          {/* Group avatar */}
          <div className="size-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
            <Users className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight text-base-content truncate">
              {selectedGroup.name}
            </h3>
            <p className="text-[10px] text-base-content/40">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setIsMembersOpen(true)}
            className="p-2 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-200/80 border border-transparent hover:border-base-300/10 transition-all duration-150 press"
            title="Members"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-200/80 border border-transparent hover:border-base-300/10 transition-all duration-150 press"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Members panel overlay */}
      {isMembersOpen && (
        <div className="fixed inset-0 z-[55] flex items-stretch justify-end animate-fade-up">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsMembersOpen(false);
              setIsAddMemberOpen(false);
            }}
          />
          <div className="relative z-10 w-full max-w-xs bg-base-100 border-l border-base-300/60 flex flex-col shadow-2xl h-full overflow-hidden">
            {/* Panel header */}
            <div className="px-4 py-4 border-b border-base-300/60 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-semibold">Group Members</h3>
                <p className="text-[10px] text-base-content/40">
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMembersOpen(false);
                  setIsAddMemberOpen(false);
                }}
                className="p-2 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-200/80 transition-all duration-150 press"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Member list */}
            <div className="flex-1 overflow-y-auto py-2">
              {members.map((member) => {
                const memberId =
                  typeof member === "object" ? member._id : member;
                const memberName =
                  typeof member === "object"
                    ? member.fullName
                    : `User ${memberId}`;
                const memberPic =
                  typeof member === "object"
                    ? member.profilePic || "/avatar.png"
                    : "/avatar.png";
                const isMe = memberId === authUser._id;
                const isMemberAdmin = memberId === adminId;
                const isOnline = onlineUsers.includes(memberId);
                const alreadyFriend = isFriend(memberId);
                const requestSent = hasSentRequest(memberId);

                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200/40 transition-all duration-150 group"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={memberPic}
                        alt={memberName}
                        className="size-9 rounded-full object-cover ring-1 ring-base-300/30"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100" />
                      )}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{memberName}</p>
                        {isMemberAdmin && (
                          <Crown className="size-3 text-amber-500 flex-shrink-0" />
                        )}
                        {isMe && (
                          <span className="text-[9px] text-base-content/30 font-medium">
                            (you)
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] ${isOnline ? "text-emerald-500" : "text-base-content/35"}`}>
                        {isOnline ? "Active now" : "Offline"}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Leave (for me) */}
                      {isMe && (
                        <button
                          onClick={() => setIsLeaveModalOpen(true)}
                          className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-all duration-150 press"
                          title="Leave group"
                        >
                          <LogOut className="size-3.5" />
                        </button>
                      )}

                      {/* Remove (admin removing others) */}
                      {isAdmin && !isMe && (
                        <button
                          onClick={() => {
                            setMemberToRemove({ _id: memberId, fullName: memberName });
                            setIsRemoveModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-base-content/40 hover:text-error hover:bg-error/10 transition-all duration-150 press opacity-0 group-hover:opacity-100"
                          title="Remove member"
                        >
                          <UserMinus className="size-3.5" />
                        </button>
                      )}

                      {/* Add friend (non-friend, not me) */}
                      {!isMe && !alreadyFriend && !requestSent && (
                        <button
                          onClick={() => sendFriendRequest(memberId)}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all duration-150 press"
                          title="Send friend request"
                        >
                          <UserPlus className="size-3.5" />
                        </button>
                      )}
                      {!isMe && !alreadyFriend && requestSent && (
                        <UserCheck className="size-3.5 text-base-content/30" title="Request sent" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div className="flex-shrink-0 border-t border-base-300/60 p-4 space-y-2">
              {/* Add Member section (all members can add their friends) */}
              {friendsNotInGroup.length > 0 && (
                <div>
                  <button
                    onClick={() => setIsAddMemberOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-base-content/70 hover:bg-base-200/70 transition-all duration-150 press border border-base-300/30"
                  >
                    <span className="flex items-center gap-2">
                      <UserPlus className="size-4 text-primary" />
                      Add Member
                    </span>
                    {isAddMemberOpen ? (
                      <ChevronUp className="size-4 text-base-content/40" />
                    ) : (
                      <ChevronDown className="size-4 text-base-content/40" />
                    )}
                  </button>

                  {isAddMemberOpen && (
                    <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
                      {friendsNotInGroup.map((friend) => (
                        <div
                          key={friend._id}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-base-200/50 transition-all duration-150"
                        >
                          <img
                            src={friend.profilePic || "/avatar.png"}
                            alt={friend.fullName}
                            className="size-7 rounded-full object-cover ring-1 ring-base-300/20"
                          />
                          <span className="text-sm flex-1 truncate text-base-content/75">
                            {friend.fullName}
                          </span>
                          <button
                            onClick={() => addGroupMember(selectedGroup._id, friend._id)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all press"
                            title="Add to group"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Delete group (admin only) */}
              {isAdmin && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-error bg-error/8 hover:bg-error/15 transition-all duration-150 press border border-error/10"
                >
                  <Trash2 className="size-4" />
                  Delete Group
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leave confirmation */}
      <ConfirmationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeave}
        title="Leave group"
        message={`Leave "${selectedGroup.name}"? You won't receive new messages and will need to be re-added.`}
        confirmText="Leave"
      />

      {/* Remove member confirmation */}
      <ConfirmationModal
        isOpen={isRemoveModalOpen}
        onClose={() => {
          setIsRemoveModalOpen(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveMember}
        title="Remove member"
        message={`Remove ${memberToRemove?.fullName || "this member"} from "${selectedGroup.name}"?`}
        confirmText="Remove"
      />

      {/* Delete group confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete group"
        message={`Permanently delete "${selectedGroup.name}" and all its messages? This cannot be undone.`}
        confirmText="Delete"
      />
    </>
  );
};

export default GroupHeader;
