import { ArtDirection } from '../types/ArtDirection.js';
import { picassoStyle } from './picasso.js';
import { Margritte_STYLE } from './magritte.js';
import { bourdinStyle } from './bourdin.js';
import { warholStyle } from './warhol.js';
import { vangoghStyle } from './vangogh.js';
import { hopperStyle } from './hopper.js';
import { mondrianStyle } from './mondrian.js';
import { rothkoStyle } from './rothko.js';
import { kandinskyStyle } from './kandinsky.js';
import { malevichStyle } from './malevich.js';
import { popovaStyle } from './popova.js';
import { cartierBressonStyle } from './cartierbresson.js';
import { arbusStyle } from './arbus.js';
import { avedonStyle } from './avedon.js';
import { egglestonStyle } from './eggleston.js';
import { leibovitzStyle } from './leibovitz.js';
import { cooperGorferStyle } from './coopergorfer.js';
import { vonWongStyle } from './vonwong.js';
import { ikigaiStyle } from './ikigai.js';
import { beepleStyle } from './beeple.js';
import { xcopyStyle } from './xcopy.js';
import { cherniakStyle } from './cherniak.js';

export type ArtistStyle = 'picasso' | 'Margritte' | 'bourdin' | 'warhol' | 'vangogh' | 'hopper' | 
                         'mondrian' | 'rothko' | 'kandinsky' | 'malevich' | 'popova' | 'cartierbresson' |
                         'arbus' | 'avedon' | 'eggleston' | 'leibovitz' | 'coopergorfer' | 'vonwong' |
                         'ikigai' | 'beeple' | 'xcopy' | 'cherniak';

export class StyleManager {
  private styles: Map<ArtistStyle, ArtDirection>;
  private readonly defaultStyle: ArtistStyle = 'cherniak';

  constructor() {
    this.styles = new Map();
    this.styles.set('picasso', picassoStyle);
    this.styles.set('Margritte', Margritte_STYLE);
    this.styles.set('bourdin', bourdinStyle);
    this.styles.set('warhol', warholStyle);
    this.styles.set('vangogh', vangoghStyle);
    this.styles.set('hopper', hopperStyle);
    this.styles.set('mondrian', mondrianStyle);
    this.styles.set('rothko', rothkoStyle);
    this.styles.set('kandinsky', kandinskyStyle);
    this.styles.set('malevich', malevichStyle);
    this.styles.set('popova', popovaStyle);
    this.styles.set('cartierbresson', cartierBressonStyle);
    this.styles.set('arbus', arbusStyle);
    this.styles.set('avedon', avedonStyle);
    this.styles.set('eggleston', egglestonStyle);
    this.styles.set('leibovitz', leibovitzStyle);
    this.styles.set('coopergorfer', cooperGorferStyle);
    this.styles.set('vonwong', vonWongStyle);
    this.styles.set('ikigai', ikigaiStyle);
    this.styles.set('beeple', beepleStyle);
    this.styles.set('xcopy', xcopyStyle);
    this.styles.set('cherniak', cherniakStyle);
  }

  getStyle(artist: ArtistStyle): ArtDirection {
    const style = this.styles.get(artist);
    if (!style) {
      throw new Error(`Style not found for artist: ${artist}`);
    }
    return style;
  }

  getDefaultStyle(): ArtDirection {
    return this.getStyle(this.defaultStyle);
  }

  getAllStyles(): Map<ArtistStyle, ArtDirection> {
    return this.styles;
  }

  isValidStyle(artist: string): artist is ArtistStyle {
    return this.styles.has(artist as ArtistStyle);
  }

  getCurrentDefaultStyleName(): ArtistStyle {
    return this.defaultStyle;
  }
} 