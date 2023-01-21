import type { QSelectProps, QInputProps } from 'quasar';
type QSelectPropsPartial = Partial<QSelectProps>;
type QInputPropsPartial = Partial<QInputProps>;

interface QSelectRestProps extends QSelectPropsPartial {}
interface QInputRestProps extends QInputPropsPartial {}

interface Country {
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

export type { Country, QSelectRestProps, QInputRestProps };
