import { useEffect, useMemo, useState } from 'react';

import { useStudentProfile } from '../context/StudentProfileContext';
import { profilePhotoDisplayUri } from '../core/scraper/features/profile/profile.photoUri';

/** Zdjęcie profilowe z cache sesji — bez ponownego pobierania przy nawigacji. */
export function useProfilePhoto() {
  const { photo, photoRevision } = useStudentProfile();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photo, photoRevision]);

  const displayUri = useMemo(
    () => profilePhotoDisplayUri(photo, photoRevision),
    [photo, photoRevision]
  );

  const showPhoto = Boolean(displayUri) && !imageError;

  return {
    displayUri,
    showPhoto,
    onImageError: () => setImageError(true),
    imageKey: displayUri,
  };
}
