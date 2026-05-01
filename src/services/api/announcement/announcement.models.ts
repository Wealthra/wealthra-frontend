export interface AnnouncementDto {
  id: number;
  title: string;
  body: string;
  severity: number;
  startsAt: string;
  endsAt: string;
  actionUrl?: string;
  actionText?: string;
}
