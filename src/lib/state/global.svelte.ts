import type { MegaMenu } from "$lib/interfaces/General";
import { MediaQuery } from 'svelte/reactivity';

class GlobalState {
  megaMenuData = $state<MegaMenu[]>([]);
  isMobile = new MediaQuery('(max-width: 768px)');
  isTablet = new MediaQuery('(max-width: 1280px)');

  constructor() {
  }

  setMegaMenu(megaMenu: MegaMenu[]) {
    this.megaMenuData = megaMenu;
  }
}

export const globalState = new GlobalState();