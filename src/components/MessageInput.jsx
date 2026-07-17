import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { ImagePlus, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSending) return;

    setIsSending(true);
    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const canSend = (text.trim() || imagePreview) && !isSending;

  return (
    <div className="flex-shrink-0 border-t border-base-300/60 bg-base-100/85 px-2.5 py-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md sm:px-4 sm:py-3">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2.5 inline-flex items-start relative animate-fade-up rounded-2xl bg-base-200/70 p-1.5 border border-base-300/40">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-16 w-16 object-cover rounded-xl border border-base-300/60 shadow-sm"
          />
          <button
            onClick={removeImage}
            type="button"
            className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-base-content text-base-100 flex items-center justify-center shadow-md hover:scale-105 transition-transform press"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 rounded-2xl border border-base-300/60 bg-base-200/45 p-1.5 transition-colors focus-within:border-primary/45 focus-within:bg-base-100/95 focus-within:shadow-sm">
        {/* Attach image */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex size-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-150 press border border-transparent
            ${imagePreview
              ? "text-primary bg-primary/10 border-primary/20"
              : "text-base-content/40 hover:text-base-content/75 hover:bg-base-200/80"
            }`}
        >
          <ImagePlus className="size-4.5" />
        </button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Text input */}
        <input
          type="text"
          className="h-10 flex-1 min-w-0 bg-transparent px-2 text-sm placeholder:text-base-content/35 focus:outline-none"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Send */}
        <button
          type="submit"
          disabled={!canSend}
          className={`flex size-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-150 press
            ${canSend
              ? "bg-primary text-primary-content shadow-md hover:brightness-105 hover:shadow-lg hover:shadow-primary/10"
              : "bg-base-200/60 text-base-content/20 cursor-not-allowed border border-base-300/10"
            }`}
        >
          <Send className="size-4.5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
