export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  subject: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
};