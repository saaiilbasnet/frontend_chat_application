import { useState } from "react";
import { X, Hash } from "lucide-react";
import toast from "react-hot-toast";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createGroup } = useGroupStore();
  const { users } = useChatStore(); // friends list

  if (!isOpen) return null;

  const toggleMember = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setIsSubmitting(true);
    const group = await createGroup(name.trim(), description.trim(), selectedIds);
    setIsSubmitting(false);
    if (group) {
      setName("");
      setDescription("");
      setSelectedIds([]);
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-base-100 border border-base-300/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-base-300/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Hash className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-base-content">New Group</h3>
              <p className="text-[10px] text-base-content/40">Add your friends to a group chat</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close group dialog"
            className="p-2 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-200/80 transition-all duration-150 press"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Group name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wider">
              Group Name <span className="text-error">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Team, Weekend Crew…"
              maxLength={60}
              className="w-full bg-base-200/60 border border-base-300/60 rounded-xl px-4 py-2.5 text-sm placeholder:text-base-content/30 focus:outline-none focus:border-primary/50 transition-all duration-150"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wider">
              Description <span className="text-base-content/30 font-normal normal-case">(optional)</span>
            </label>
            <input
              id="group-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              maxLength={120}
              className="w-full bg-base-200/60 border border-base-300/60 rounded-xl px-4 py-2.5 text-sm placeholder:text-base-content/30 focus:outline-none focus:border-primary/50 transition-all duration-150"
            />
          </div>

          {/* Friends selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wider">
              Add Friends
              {selectedIds.length > 0 && (
                <span className="ml-1.5 text-primary font-semibold">{selectedIds.length} selected</span>
              )}
            </label>

            {users.length === 0 ? (
              <p className="text-xs text-base-content/35 py-4 text-center">
                No friends yet — add some friends first.
              </p>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1 -mr-1">
                {users.map((user) => {
                  const checked = selectedIds.includes(user._id);
                  return (
                    <label
                      key={user._id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 select-none
                        ${checked ? "bg-primary/8 border border-primary/20" : "hover:bg-base-200/50 border border-transparent"}`}
                    >
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="size-8 rounded-full object-cover flex-shrink-0 ring-1 ring-base-300/30"
                      />
                      <span className={`text-sm flex-1 truncate ${checked ? "text-primary font-medium" : "text-base-content/75"}`}>
                        {user.fullName}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(user._id)}
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-base-content/60 hover:text-base-content hover:bg-base-200 transition-all duration-150 press"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-primary-content hover:brightness-105 transition-all duration-150 press disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating…" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
