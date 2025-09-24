const getImmutableImage = (url: string) => {
  return !url?.endsWith('.svg') ? `https://images.hive.blog/640x0/${url}` : url;
};

const ImageUtils = {getImmutableImage};

export default ImageUtils;
