export interface AnnouncementDto {
  id: number;
  titleEn: string;
  titleTr: string;
  bodyEn: string;
  bodyTr: string;
  severity: number;
  startsAt: string;
  endsAt: string;
  actionUrl?: string;
  actionText?: string;
}
