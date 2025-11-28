import { useRouter, useSegments } from 'expo-router';
import { useCallback } from 'react';

/**
 * safeBack tries to go back in the router history. If the resulting
 * active segment is the app root (e.g. [''] or ['(tabs)', 'index'] or 'inicio'), it will
 * instead push the provided fallback destination so the user returns to a meaningful screen.
 *
 * Usage: const safeBack = useSafeBack(); safeBack('detalle-billetera', { id: '5' });
 */
export function useSafeBack() {
  const router = useRouter();
  const segments = useSegments();

  const safeBack = useCallback(
    (fallback?: string, params?: Record<string, string>) => {
      // If we are deeply nested (more than one segment) a normal back should be fine.
      // If we are at the root of the tabs stack (segments length <= 1), do a push to the fallback instead.
      // To be explicit and avoid accidental navigation to the app root, convert
      // short fallback names (e.g. 'detalle-billetera') to absolute tab paths
      // (e.g. '/(tabs)/detalle-billetera'). If the caller provides an absolute
      // path (starts with '/'), we use it as-is.
      const makePath = (f?: string) => {
        if (!f) return undefined;
        if (f.startsWith('/')) return f;
        return `/(tabs)/${f}`;
      };

      try {
        if (segments && segments.length > 1) {
          // If caller provided a fallback, only do a router.back() when the
          // previous segment matches the fallback. Otherwise, push the
          // fallback explicitly so we don't accidentally navigate to some
          // unrelated previous screen (e.g. Inicio).
          if (fallback) {
            const normalize = (f: string) => {
              if (!f) return '';
              if (f.startsWith('/')) {
                const parts = f.split('/').filter(Boolean);
                return parts[parts.length - 1] || '';
              }
              return f;
            };

            const prevSegment = segments[segments.length - 2] || '';
            const fallbackSeg = normalize(fallback);

            if (prevSegment === fallbackSeg) {
              router.back();
              return;
            }

            // previous segment is not the desired fallback — push it explicitly
            const fullPath = makePath(fallback);
            if (fullPath) {
              if (params) {
                router.push({ pathname: fullPath as any, params } as any);
              } else {
                router.push(fullPath as any);
              }
              return;
            }
          } else {
            // no fallback requested — perform a normal back
            router.back();
            return;
          }
        }

        const fullPath = makePath(fallback);
        if (fullPath) {
          if (params) {
            router.push({ pathname: fullPath as any, params } as any);
          } else {
            router.push(fullPath as any);
          }
          return;
        }

        // last resort: try native back
        router.back();
      } catch (e) {
        const fullPath = makePath(fallback);
        if (fullPath) {
          if (params) {
            router.push({ pathname: fullPath as any, params } as any);
          } else {
            router.push(fullPath as any);
          }
        }
      }
    },
    [router, segments]
  );

  return safeBack;
}
