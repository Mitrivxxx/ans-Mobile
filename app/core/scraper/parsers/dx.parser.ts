export interface DxResponse {
  customOperationState: string;
  callbackState: string;
  html: string;
}

export function parseDxResponse(raw: string): DxResponse {
  const dxMarker = '/*DXHTML*/';

  const dxEnd = raw.indexOf(dxMarker);

  if (dxEnd === -1) {
    throw new Error(
      'Nie znaleziono DXHTML marker'
    );
  }

  const customMatch = raw.match(
    /'customOperationState':'([^']+)'/
  );

  const callbackMatch = raw.match(
    /'callbackState':'([^']+)'/
  );

  if (!customMatch?.[1]) {
    throw new Error(
      'Brak customOperationState'
    );
  }

  if (!callbackMatch?.[1]) {
    throw new Error(
      'Brak callbackState'
    );
  }

  return {
    customOperationState: customMatch[1],
    callbackState: callbackMatch[1],
    html: raw.slice(dxEnd + dxMarker.length)
  };
}