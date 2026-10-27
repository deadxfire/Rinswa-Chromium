// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {getImage} from '//resources/js/icon.js';
import {html} from '//resources/lit/v3_0/lit.rollup.js';

import type {CrProfileAvatarSelectorElement} from './cr_profile_avatar_selector.js';

export function getHtml(this: CrProfileAvatarSelectorElement) {
  return html`
<div class="avatar-selector-wrapper" style="display: flex; flex-direction: column; width: 100%;">
  <input type="file" id="customAvatarFileInput" accept="image/png, image/jpeg, image/webp" style="display: none;" @change="${this.onCustomAvatarFileChange_}">

<cr-grid id="avatar-grid" role="radiogroup" columns="${this.columns}"
    focus-selector=".avatar"
    .ignoreModifiedKeyEvents="${this.ignoreModifiedKeyEvents}">
  <div>
    <div class="avatar-container ${this.customAvatarUrl_ ? 'iron-selected' : ''}" title="Choose from file">
      <cr-button class="avatar custom-avatar-circle" role="radio" id="customAvatarUploadOption"
          aria-label="Choose avatar from file"
          tabindex="0"
          @click="${this.onChooseFileClick_}"
          .style="${this.customAvatarUrl_ ? `background-image: url(${this.customAvatarUrl_}); background-size: cover;` : 'display: flex; align-items: center; justify-content: center; background-color: var(--google-grey-100, #f1f3f4); border: 2px dashed var(--google-grey-400, #bdc1c6);'}"
          aria-checked="${this.customAvatarUrl_ ? 'true' : 'false'}">
        ${!this.customAvatarUrl_ ? html`
          <cr-icon icon="cr:add" style="--cr-icon-size: 28px; width: 28px; height: 28px; color: var(--cr-secondary-text-color, #5f6368);"></cr-icon>
        ` : ''}
      </cr-button>
      <cr-icon icon="cr:check" class="checkmark"></cr-icon>
    </div>
    <cr-tooltip for="customAvatarUploadOption" offset="0" fit-to-visible-bounds>
      Choose from file
    </cr-tooltip>
  </div>

  ${this.avatars.map((item, index) => html`
    <!-- Wrapper div is needed so that only a single node is slotted in
        cr-grid for each avatar. -->
    <div>
      <div class="avatar-container ${this.getSelectedClass_(item)}">
        <cr-button class="avatar" role="radio" id="${this.getAvatarId_(index)}"
            data-index="${index}" aria-label="${item.label}"
            tabindex="${this.getTabIndex_(index, item)}"
            @click="${this.onAvatarClick_}"
            .style="background-image: ${getImage(item.url)}"
            aria-checked="${this.isAvatarSelected_(item)}">
        </cr-button>
        <cr-icon icon="cr:check" class="checkmark"></cr-icon>
      </div>
      <cr-tooltip for="${this.getAvatarId_(index)}" offset="0"
          fit-to-visible-bounds>
        ${item.label}
      </cr-tooltip>
    </div>
  `)}
</cr-grid>
</div>`;
}
