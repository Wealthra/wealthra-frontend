# Admin API surface — bileşen eşlemesi

Bu dosya, yönetici arayüzündeki API çağrılarının hangi Vue bileşeninden yapıldığını özetler. Path’inde doğrudan `admin` geçmeyen ancak yalnızca admin akışında kullanılan uçlar **Admin-only (path’te admin yok)** bölümünde listelenir.

## 1. `admin/*` — `admin.service.ts`

| HTTP | Path |
|------|------|
| GET | `admin/users?page=&pageSize=&search=` |
| GET | `admin/users/{userId}` |
| POST | `admin/users/{userId}/lock` |
| PUT | `admin/users/{userId}/roles` |
| POST | `admin/users/{userId}/revoke-sessions` |
| POST | `admin/users/{userId}/password` |
| GET | `admin/announcements` |
| POST | `admin/announcements` |
| DELETE | `admin/announcements/{id}` |
| GET | `admin/settings/ai` |
| PUT | `admin/settings/ai` |
| GET | `admin/analytics/revenue` |
| GET | `admin/analytics/growth` |
| GET | `admin/monitoring/errors?skip=&take=` |
| GET | `admin/monitoring/audit?skip=&take=` |
| GET | `admin/monitoring/ai-usage?days=` |
| GET | `admin/fx/manual-rates` |
| POST | `admin/fx/manual-rates` |
| GET | `admin/fx/provider-order` |
| PUT | `admin/fx/provider-order` |
| GET | `admin/security/blocked-ips` |
| POST | `admin/security/blocked-ips` |
| DELETE | `admin/security/blocked-ips/{ip}` |

## 2. `AdminPlans/*` — `adminPlans.service.ts`

| HTTP | Path |
|------|------|
| GET | `AdminPlans/plans?includeInactive=` |
| POST | `AdminPlans/plans` |
| PUT | `AdminPlans/plans/{id}` |
| DELETE | `AdminPlans/plans/{id}` |
| PUT | `AdminPlans/plans/assign` |
| GET | `AdminPlans/plans/{id}/users` |
| GET | `AdminPlans/usage/summary` |

## 3. Diğer path’ler + Admin-only (path’te `admin` yok)

| HTTP | Path | Dosya |
|------|------|--------|
| GET | `support/tickets/admin?...` | `support.service.ts` |
| POST | `support/tickets/{id}/reply` | `support.service.ts` (`replyTicket`) |
| PUT | `Account/admin/update-tier` | `account.service.ts` |
| GET | `Account/admin/usages?email=&name=` | `account.service.ts` |

---

## Bileşen → servis metodu

| Bileşen | Servis metodu | Endpoint özeti |
|---------|----------------|----------------|
| `AdminView.vue` | `adminPlansService.getPlans`, `getUsageSummary`, `deletePlan` | plan listesi, kullanım özeti, plan silme |
| `AdminAnalyticsView.vue` | `getRevenueAnalytics`, `getGrowthAnalytics` | `/admin/analytics` gelir & büyüme |
| `AdminUsageSummary.vue` | — | Veriyi `AdminView` üzerinden prop alır |
| `AdminUserManagementTable.vue` | `adminService.getUsers`, `lockUser`, `setPassword` | kullanıcı listesi / kilit / şifre |
| `AdminUserManagementTable.vue` | `accountService.updateTier`, `getAdminUsages` | tier güncelleme, hesap kullanım detayı |
| `AdminPlanTable.vue` | `adminPlansService.getPlanUsers` | plana bağlı kullanıcılar |
| `UIPlanModal.vue` | `adminPlansService.createPlan`, `updatePlan` | plan oluştur / güncelle |
| `AdminUserAssignment.vue` | `adminPlansService.assignPlanToUser` | plan atama |
| `AdminSupportTickets.vue` | `supportService.getAdminTickets`, `replyTicket` | admin bilet listesi, yanıt (`.../reply`) |
| `AdminAnnouncements.vue` | `adminService.getAnnouncements`, `createAnnouncement`, `deleteAnnouncement` | duyurular |
| `AdminFxControls.vue` | `getManualRates`, `getProviderOrder`, `setManualRate`, `updateProviderOrder` | FX |
| `AdminAiSettings.vue` | `getAiSettings`, `updateAiSettings` | AI ayarları |
| `AdminSecurity.vue` | `getBlockedIps`, `blockIp`, `unblockIp` | IP engeli |
| `AdminErrorLogs.vue` | `adminService.getErrors` | hata logları (sayfalama) |

### `admin.service.ts` — henüz admin bileşenine bağlı olmayan metodlar

Bu metodlar serviste tanımlıdır; mevcut `auth/admin` bileşenlerinde çağrılmıyor olabilir:

- `getUserDetails`, `updateRoles`, `revokeSessions`
- `getAuditLogs`, `getAiUsage`

İhtiyaç halinde Analytics / Audit / AI kullanım panelleriyle eşlenebilir.
