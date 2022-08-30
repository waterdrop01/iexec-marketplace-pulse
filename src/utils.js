import { createContext } from 'react';

export const round = (value, precision) => {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

export const validators = [
  '0xc9DDaf577feb7E036148AaEA55D09F76A2D2031A',
  '0xcEa932E508BF87A5cB966379988A6B3A6A8E0fdD',
  '0xFc44aE5c2F7377B5484fFE7813D83c96C1529848',
  '0x02BbE17B1ee0E35D20D653Fc39c8bB086Af71D53',
  '0xEAD725076dB4B2e57477E0856809729763949B60',
  '0x88366e924BC4Ecc48f3B4b8B844457298810Bc28',
  '0xc5a743aBaf6C73ef6b49B2d540eE18Df23d3Be69',
  '0x63b4eFaE8b5d26662ea5700Cf2b057e382D4805A',
];

export const AppContext = createContext(null);
