import { useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useGroupStore } from "../store/useGroupStore";

const GroupMessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  const { sendGroupMessage, selectedGroup } = useGroupStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
      await sendGroupMessage(selectedGroup._id, {
        text: text.trim(),
        image: imagePreview,
      });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send group message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const canSend = (text.trim() || imagePreview) && !isSending;

  return (
    <div className="px-3 sm:px-4 py-3 border-t border-base-300/60 bg-transparent">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2.5 inline-flex items-start relative animate-fade-up">
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
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {/* Attach image */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2.5 rounded-xl transition-all duration-150 flex-shrink-0 press border border-transparent
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
          className="flex-1 min-w-0 bg-base-200/60 border border-base-300/60 rounded-xl px-4 py-2.5 text-sm placeholder:text-base-content/30 focus:outline-none focus:border-primary/50 focus:bg-base-200/80 transition-all duration-150"
          placeholder="Message the group…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Send */}
        <button
          type="submit"
          disabled={!canSend}
          className={`p-2.5 rounded-xl transition-all duration-150 flex-shrink-0 press
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

export default GroupMessageInput;
