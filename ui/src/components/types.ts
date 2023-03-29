import { QSelectProps, QInputProps } from 'quasar';

export type QSelectRestProps = Partial<QSelectProps>;
export type QInputRestProps = Partial<QInputProps>;

export interface Country {
  name: string;
  iso2: string;
  dialCode: string;
  native?: string;
  continent_name?: string;
  capital?: string;
  currency?: string;
  languages?: string[];
  emoji?: string;
  emojiU?: string;
  iso2LC?: string;
  nameLC?: string;
}
