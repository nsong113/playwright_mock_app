/**
 * Timeout을 안전하게 정리하는 유틸리티 함수
 */
export function clearTimeoutSafely(
  timeoutId: NodeJS.Timeout | number | null | undefined
): void {
  if (timeoutId != null) {
    clearTimeout(timeoutId);
  }
}

/**
 * Interval을 안전하게 정리하는 유틸리티 함수
 */
export function clearIntervalSafely(
  intervalId: NodeJS.Timeout | number | null | undefined
): void {
  if (intervalId != null) {
    clearInterval(intervalId);
  }
}
