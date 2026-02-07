import { useEffect, useState } from "react";
import { getMediaUrl } from "@/api/utils/getMediaUrl";

interface ImageProps {
    path: string;
    alt?: string;
    className?: string;
}

export default function ImageComponent({ path, alt, className }: ImageProps) {
  const [state, setState] = useState({
    url: null as string | null,
    error: false,
  });

  useEffect(() => {
    let active = true;

    setState({ url: null, error: false });

    getMediaUrl(path)
      .then((u) => {
        if (active && u) {
            console.log("Image loaded:", u);
            setState({ url: u, error: false });
        }
        if (active && !u) setState({ url: null, error: true });
      })
      .catch(() => {
        if (active) setState({ url: null, error: true });
      });

    return () => {
      active = false;
    };
  }, [path]);

  if (state.error) {
    return <div className={`bg-gray-200 ${className}`} />;
  }

  if (!state.url) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} />;
  }

  return (
    <img
      src={state.url}
      alt={alt}
      className={className}
      onError={() => setState({ url: null, error: true })}
      loading="lazy"
    />
  );
}
