/**
 * 데이터를 한 번도 못 받은 쿼리는 재요청할 때마다 query-core 가 상태를 되돌립니다.
 *
 *   // @tanstack/query-core — query.js
 *   function fetchState(data, options) {
 *     return {
 *       fetchStatus: "fetching",
 *       ...data === void 0 && { error: null, status: "pending" }
 *     };
 *   }
 *
 * 그래서 재요청 중에는 isError 가 false 이고 isLoading 이 다시 true 가 됩니다.
 * 재요청에도 리셋되지 않고 누적되는 신호는 errorUpdateCount 뿐이라 그걸 봅니다.
 */
export function hasLoadFailed(query: { errorUpdateCount: number }): boolean {
  return query.errorUpdateCount > 0;
}
