// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview 'cr-profile-avatar-selector' is an element that displays
 * profile avatar icons and allows an avatar to be selected.
 */

import '../cr_button/cr_button.js';
import '../cr_grid/cr_grid.js';
import '../cr_icon/cr_icon.js';
import '../cr_tooltip/cr_tooltip.js';
import '../icons.html.js';

import {assert} from '//resources/js/assert.js';
import {CrLitElement} from '//resources/lit/v3_0/lit.rollup.js';
import type {PropertyValues} from '//resources/lit/v3_0/lit.rollup.js';

import {getCss} from './cr_profile_avatar_selector.css.js';
import {getHtml} from './cr_profile_avatar_selector.html.js';

export interface AvatarIcon {
  url: string;
  label: string;
  index: number;
  isGaiaAvatar: boolean;
  selected: boolean;
}

export class CrProfileAvatarSelectorElement extends CrLitElement {
  static get is() {
    return 'cr-profile-avatar-selector';
  }

  static override get styles() {
    return getCss();
  }

  override render() {
    return getHtml.bind(this)();
  }

  static override get properties() {
    return {
      /**
       * The list of profile avatar URLs and labels.
       */
      avatars: {type: Array},

      /**
       * The currently selected profile avatar icon, if any.
       */
      selectedAvatar: {
        type: Object,
        notify: true,
      },

      ignoreModifiedKeyEvents: {type: Boolean},

      /**
       * The currently selected profile avatar icon index, or '-1' if none is
       * selected.
       */
      tabFocusableAvatar_: {type: Number},

      /**
       * Number of columns in the grid.
       */
      columns: {type: Number},

      customAvatarUrl_: {type: String},
    };
  }

  accessor avatars: AvatarIcon[] = [];
  accessor selectedAvatar: AvatarIcon|null = null;
  accessor ignoreModifiedKeyEvents: boolean = false;
  accessor columns: number = 6;
  protected accessor customAvatarUrl_: string = '';
  private accessor tabFocusableAvatar_: number = -1;

  override willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('avatars') ||
        changedProperties.has('selectedAvatar')) {
      const gaiaAvatar = this.avatars.find(a => a.isGaiaAvatar);
      if (gaiaAvatar) {
        if (!this.customAvatarUrl_) {
          this.customAvatarUrl_ = gaiaAvatar.url;
        }
        if (gaiaAvatar.selected && !this.selectedAvatar) {
          this.selectedAvatar = gaiaAvatar;
        }
      }
      const selectedAvatar =
          this.avatars.find(avatar => this.isAvatarSelected_(avatar));
      this.tabFocusableAvatar_ = selectedAvatar ? selectedAvatar.index : -1;
    }
  }

  protected getAvatarId_(index: number): string {
    return 'avatarId' + index;
  }

  protected getTabIndex_(index: number, item: AvatarIcon): string {
    if (item.index === this.tabFocusableAvatar_) {
      return '0';
    }

    // If no avatar is selected, focus the first element of the grid on 'tab'.
    if (this.tabFocusableAvatar_ === -1 && index === 0) {
      return '0';
    }
    return '-1';
  }

  protected getSelectedClass_(avatarItem: AvatarIcon): string {
    // TODO(dpapad): Rename 'iron-selected' to 'selected' now that this CSS
    // class is not assigned by any iron-* behavior.
    return this.isAvatarSelected_(avatarItem) ? 'iron-selected' : '';
  }

  protected isAvatarSelected_(avatarItem: AvatarIcon): boolean {
    if (avatarItem.isGaiaAvatar) {
      return !!this.customAvatarUrl_ && (avatarItem.selected || (!!this.selectedAvatar && this.selectedAvatar.isGaiaAvatar));
    }
    return (!this.customAvatarUrl_ && avatarItem.selected) ||
        (!!this.selectedAvatar && !this.selectedAvatar.isGaiaAvatar &&
         this.selectedAvatar.index === avatarItem.index);
  }

  protected onAvatarClick_(e: Event) {
    this.customAvatarUrl_ = '';
    // |selectedAvatar| is set to pass back selection to the owner of this
    // component.
    const target = e.currentTarget as HTMLElement;
    const index = Number(target.dataset['index']);
    const nonGaiaAvatars = this.avatars.filter(a => !a.isGaiaAvatar);
    this.selectedAvatar = nonGaiaAvatars[index] || this.avatars[index]!;

    // Autoscroll to selected avatar if it is not completely visible.
    const avatarList =
        this.shadowRoot.querySelectorAll<HTMLElement>('.avatar-container');
    assert(avatarList.length > 0);
    // Offset by 1 for the custom upload avatar item in the grid
    const selectedAvatarElement = avatarList[index + 1] || avatarList[index];
    selectedAvatarElement!.scrollIntoViewIfNeeded();
  }

  protected onChooseFileClick_() {
    if (this.customAvatarUrl_) {
      const gaiaAvatar = this.avatars.find(a => a.isGaiaAvatar);
      if (gaiaAvatar) {
        this.selectedAvatar = gaiaAvatar;
        this.fire('selected-avatar-changed', {value: gaiaAvatar});
      }
    }
    const input = this.shadowRoot.querySelector<HTMLInputElement>('#customAvatarFileInput');
    if (input) {
      input.click();
    }
  }

  protected onCustomAvatarFileChange_(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }

        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 128, 128);

        const pngDataUrl = canvas.toDataURL('image/png');
        this.customAvatarUrl_ = pngDataUrl;
        this.selectedAvatar = null;

        const win = window as {
          chrome?: {send?: (message: string, args?: unknown[]) => void},
        };
        if (win.chrome && win.chrome.send) {
          try {
            win.chrome.send('setProfileIconFromFile', [pngDataUrl]);
          } catch (_) {}
          try {
            win.chrome.send('setAvatarIconFromFile', [pngDataUrl]);
          } catch (_) {}
        }

        this.fire('custom-avatar-selected', pngDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cr-profile-avatar-selector': CrProfileAvatarSelectorElement;
  }
}

customElements.define(
    CrProfileAvatarSelectorElement.is, CrProfileAvatarSelectorElement);
