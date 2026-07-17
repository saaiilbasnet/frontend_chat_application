import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  // A chat pane is open if either a DM user or a group is selected
  const isChatOpen = Boolean(selectedUser || selectedGroup);

  return (
    <div className="min-h-dvh bg-base-200/50 relative overflow-hidden flex items-center justify-center pt-14">
      {/* Cohesive background accents */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-6xl h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-6.5rem)] md:px-4 z-10">
        <div className="bg-base-100/75 border-y md:border border-base-300/60 backdrop-blur-xl h-full md:rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar: hidden on mobile when a chat is open */}
            <div className={`${isChatOpen ? "hidden md:flex" : "flex"} h-full w-full md:w-auto`}>
              <Sidebar />
            </div>

            {/* Chat pane: hidden on mobile when no chat is open */}
            <div className={`${isChatOpen ? "flex" : "hidden md:flex"} h-full min-h-0 flex-1 min-w-0`}>
              {selectedGroup ? (
                <GroupChatContainer />
              ) : selectedUser ? (
                <ChatContainer />
              ) : (
                <NoChatSelected />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
