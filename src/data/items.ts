import type { MenuItem } from '../types/cafe';

import { CHAIN_STARBUCKS_ITEMS } from './catalog/starbucks.ts';

import { CHAIN_ESPRESSOLAB_ITEMS } from './catalog/espressolab.ts';

import { CHAIN_KAHVE_DUNYASI_ITEMS } from './catalog/kahve_dunyasi.ts';

import { CHAIN_CAFFE_NERO_ITEMS } from './catalog/caffe_nero.ts';

import { CHAIN_COFFY_ITEMS } from './catalog/coffy.ts';

import { CHAIN_MACKBEAR_ITEMS } from './catalog/mackbear.ts';

import { CHAIN_ARABICA_ITEMS } from './catalog/arabica.ts';

import { CHAIN_GLORIA_JEANS_ITEMS } from './catalog/gloria_jeans.ts';

import { CHAIN_DAVID_PEOPLE_ITEMS } from './catalog/david_people.ts';

import { CHAIN_TCHIBO_ITEMS } from './catalog/tchibo.ts';

export const MENU_ITEMS: MenuItem[] = [
  ...CHAIN_STARBUCKS_ITEMS,
  ...CHAIN_ESPRESSOLAB_ITEMS,
  ...CHAIN_KAHVE_DUNYASI_ITEMS,
  ...CHAIN_CAFFE_NERO_ITEMS,
  ...CHAIN_COFFY_ITEMS,
  ...CHAIN_MACKBEAR_ITEMS,
  ...CHAIN_ARABICA_ITEMS,
  ...CHAIN_GLORIA_JEANS_ITEMS,
  ...CHAIN_DAVID_PEOPLE_ITEMS,
  ...CHAIN_TCHIBO_ITEMS,
];
