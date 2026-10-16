
import { useRef, useState } from "react";
import {
  Stethoscope,
  Image as ImageIcon,
  ClipboardList,
  Plus,
  Video,
  Sparkles,
  ArrowUpRight,
  X,
  LoaderCircle,
} from "lucide-react";


import "./CreatorPostCard.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function CreatePostCard({
  mode = "feed",
  onCreatePost,
  onCreateStory,
  onOpenClinicalCase,
  onOpenAIAssistant,
  onOpenVideo,
}) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const imageInputRef = useRef(null);
  const storyInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const isClinical = mode === "clinical-cases";

  function chooseImage(file) {
    setError("");
    setSuccess("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!content.trim() && !selectedImage) {
      setError("Write something or select an image before posting.");
      return;
    }

    if (selectedImage) {
      setError(
        "Image preview is ready, but image publishing requires a verified post-upload endpoint. Remove the image to publish a text post."
      );
      return;
    }

    if (!onCreatePost) {
      setError("Post creation is not connected.");
      return;
    }

    setSubmitting(true);

    try {
      await onCreatePost(content.trim());
      setContent("");
      setSuccess("Your post was published.");
    } catch (err) {
      setError(err.message || "Unable to publish your post.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStoryChange(event) {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    if (!image.type.startsWith("image/")) {
      setError("Please select an image for your story.");
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
      setError("Story images must not exceed 5 MB.");
      return;
    }

    const caption = window.prompt("Add a story caption (optional):") || "";

    if (!onCreateStory) {
      setError("Story creation is not connected.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await onCreateStory(image, caption);
      setSuccess("Your story was uploaded.");
    } catch (err) {
      setError(err.message || "Unable to upload your story.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleVideoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }

    if (onOpenVideo) {
      onOpenVideo(file);
    } else {
      setError(
        "Video preview is not connected yet. A video upload endpoint must be verified before publishing."
      );
    }
  }

  return (
    <section className="white-card create-post-card">
      <form onSubmit={handleSubmit}>
        <label className="create-post-input">
          <Stethoscope size={22} aria-hidden="true" />
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder={
              isClinical
                ? "Share a clinical case with your community..."
                : "Share a discovery, a case, a little inspiration..."
            }
            aria-label="Post content"
            rows={1}
            maxLength={5000}
          />
        </label>

        <div className="create-post-ai">
          <span className="create-post-ai-icon">
            <Sparkles size={16} />
          </span>
          <span>
            <strong>Zynvo AI</strong>
            <small>FREE</small>
          </span>
          <span className="create-post-ai-spacer" />
          <button
            type="button"
            onClick={() => onOpenAIAssistant?.()}
            disabled={!onOpenAIAssistant}
            title={
              onOpenAIAssistant
                ? "Open AI case assistant"
                : "AI assistant endpoint is not configured"
            }
          >
            AI assistant
          </button>
        </div>

        {imagePreview && (
          <div className="create-post-preview">
            <img src={imagePreview} alt="Selected post preview" />
            <button
              type="button"
              onClick={clearImage}
              aria-label="Remove selected image"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <input
          ref={imageInputRef}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => chooseImage(event.target.files?.[0])}
        />

        <input
          ref={storyInputRef}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleStoryChange}
        />

        <input
          ref={videoInputRef}
          hidden
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />

        <div className="create-post-actions">
          <div className="create-post-options">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon size={18} />
              <span>Photo / Post</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenClinicalCase?.()}
            >
              <ClipboardList size={18} />
              <span>Clinical case</span>
            </button>

            <button
              type="button"
              onClick={() => storyInputRef.current?.click()}
            >
              <Plus size={18} />
              <span>Story</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
            >
              <Video size={18} />
              <span>Short video</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAIAssistant?.()}
              disabled={!onOpenAIAssistant}
            >
              <Sparkles size={18} />
              <span>AI case assistant</span>
            </button>
          </div>

          <button
            type="submit"
            className="post-submit"
            disabled={submitting || (!content.trim() && !selectedImage)}
          >
            {submitting ? (
              <LoaderCircle size={17} className="create-post-spinner" />
            ) : (
              <>
                Post <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="create-post-message error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="create-post-message success" role="status">
            {success}
          </p>
        )}
      </form>
    </section>
  );
}
