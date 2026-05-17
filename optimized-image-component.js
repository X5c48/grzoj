// 优化后的图片组件
const OptimizedImage = ({
  src,
  srcSet,
  sizes,
  alt,
  className = "",
  wrapperClassName = "",
  placeholder = true,
  blurDataURL,
  aspectRatio,
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // 渐进式加载处理
  const renderPlaceholder = () => {
    if (blurDataURL) {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            filter: "blur(8px)",
            transform: "scale(1.05)",
          }}
          aria-hidden="true"
        />
      );
    }
    if (placeholder) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" aria-hidden="true" />
      );
    }
    return null;
  };

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && !hasError && renderPlaceholder()}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          图片加载失败
        </div>
      )}
      
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        } ${className}`}
        {...props}
      />
    </div>
  );
};

// 图片预加载工具
const preloadImages = (urls) => {
  return Promise.all(
    urls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    })
  );
};

// Intersection Observer 懒加载 Hook
const useIntersectionObserver = (options = {}) => {
  const ref = React.useRef(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, {
      rootMargin: "100px",
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
};

// 响应式图片配置生成器
const generateResponsiveImage = (baseUrl, formats = ["webp", "jpg"]) => {
  const sizes = [320, 640, 960, 1280, 1920];
  
  const srcSet = sizes
    .map((size) => {
      const urls = formats.map((format) => {
        const ext = format === "webp" ? "webp" : "jpg";
        return `${baseUrl.replace(/\.[^.]+$/, `-${size}.${ext}`)} ${size}w`;
      });
      return urls.join(", ");
    })
    .join(", ");

  return {
    srcSet,
    sizes: "(max-width: 320px) 280px, (max-width: 640px) 600px, (max-width: 1200px) 960px, 1280px",
  };
};
