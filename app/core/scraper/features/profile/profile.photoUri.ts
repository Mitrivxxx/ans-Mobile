/** URI zdjęcia z cache-bust dla odświeżenia w Image (pomija data: URI). */
export function profilePhotoDisplayUri(
  photo: string,
  revision: number
): string {
  if (!photo) {
    return "";
  }

  if (photo.startsWith("data:")) {
    return photo;
  }

  const separator = photo.includes("?") ? "&" : "?";
  return `${photo}${separator}_v=${revision}`;
}
