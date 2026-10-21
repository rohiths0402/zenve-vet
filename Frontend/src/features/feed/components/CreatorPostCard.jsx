
import { useEffect, useRef, useState } from "react";
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

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

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

  // Release the temporary preview URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function chooseImage(file) {
    setError("");
    setSuccess("");

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, WEBP, or GIF image.");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must not exceed 5 MB.");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setSelectedImage(null);
    setImagePreview("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedImage) {
      setError("Write something or select an image before posting.");
      return;
    }

    if (typeof onCreatePost !== "function") {
      setError("Post creation is not connected. Please check FeedPage.jsx.");
      return;
    }

    setSubmitting(true);

    try {
      // Callback receives the caption and the optional image File.
      // FeedPage / feedService must forward the image to Django as FormData.
      await onCreatePost(trimmedContent, selectedImage);

      setContent("");
      clearImage();
      setSuccess("Your post was published.");
    } catch (err) {
      setError(
        err?.message || "Unable to publish your post. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStoryChange(event) {
    const image = event.target.files?.[0];
    event.target.value = "";

    if (!image) return;

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      setError("Choose a JPG, PNG, WEBP, or GIF image for your story.");
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
      setError("Story images must not exceed 5 MB.");
      return;
    }

    if (typeof onCreateStory !== "function") {
      setError("Story creation is not connected.");
      return;
    }

    const caption = window.prompt("Add a story caption (optional):") || "";

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await onCreateStory(image, caption.trim());
      setSuccess("Your story was uploaded.");
    } catch (err) {
      setError(err?.message || "Unable to upload your story.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleVideoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    if (typeof onOpenVideo === "function") {
      onOpenVideo(file);
    } else {
      setError("Video upload or preview is not connected yet.");
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
            disabled={!onOpenAIAssistant || submitting}
            title="Open AI case assistant"
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
              disabled={submitting}
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
              disabled={submitting}
            >
              <ImageIcon size={18} />
              <span>Photo / Post</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenClinicalCase?.()}
              disabled={submitting || !onOpenClinicalCase}
            >
              <ClipboardList size={18} />
              <span>Clinical case</span>
            </button>

            <button
              type="button"
              onClick={() => storyInputRef.current?.click()}
              disabled={submitting}
            >
              <Plus size={18} />
              <span>Story</span>
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={submitting}
            >
              <Video size={18} />
              <span>Short video</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAIAssistant?.()}
              disabled={!onOpenAIAssistant || submitting}
            >
              <Sparkles size={18} />
              <span>AI case assistant</span>
            </button>
          </div>

          <button
            type="submit"
            className="post-submit"
            disabled={
              submitting || (!content.trim() && !selectedImage)
            }
          >
            {submitting ? (
              <LoaderCircle
                size={17}
                className="create-post-spinner"
              />
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
