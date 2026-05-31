import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200/50 relative overflow-hidden flex items-center justify-center pt-14">
      {/* Cohesive background accents */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Main Container */}
      <div className="w-full max-w-6xl h-[calc(100vh-6.5rem)] px-4 z-10">
        <div className="bg-base-100/75 border border-base-300/60 backdrop-blur-xl h-full rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex h-full">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
