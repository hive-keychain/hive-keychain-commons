const getImmutableImage = (url: string) => {
  return !(
    url?.endsWith('.svg') || url?.startsWith('https://images.hive.blog/')
  )
    ? `https://images.hive.blog/0x0/${url}`
    : url;
};

const ImageUtils = { getImmutableImage };

export default ImageUtils;
