export interface CreateDiaryDto {
  title: string;
  content: string;
  location?: string;
  tags?: string[];
  images?: string[];
  happenedAt?: string;
}

export interface DiaryEntry extends CreateDiaryDto {
  id: string;
  createdAt: string;
}
