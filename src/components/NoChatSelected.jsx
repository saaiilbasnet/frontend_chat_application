import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-base-100 select-none">
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        {/* Icon */}
        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="size-6 text-primary" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-semibold">No conversation selected</h2>
          <p className="text-sm text-base-content/40 max-w-[22ch]">
            Pick a contact from the sidebar to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
