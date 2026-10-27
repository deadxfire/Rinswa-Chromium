// Copyright 2012 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "ui/views/controls/menu/menu_config.h"

#include "base/debug/dump_without_crashing.h"
#include "base/no_destructor.h"
#include "ui/base/ui_base_features.h"
#include "ui/views/controls/menu/menu_controller.h"
#include "ui/views/controls/menu/menu_item_view.h"
#include "ui/views/layout/layout_provider.h"
#include "ui/views/style/typography.h"
#include "ui/views/style/typography_provider.h"

#if BUILDFLAG(IS_OZONE)
#include "ui/ozone/public/ozone_platform.h"
#endif

namespace views {

MenuConfig::MenuConfig() {
  InitCommon();
  InitPlatform();
}

MenuConfig::~MenuConfig() = default;

int MenuConfig::CornerRadiusForMenu(const MenuController* controller) const {
#if BUILDFLAG(IS_OZONE)
  if (!ui::OzonePlatform::GetInstance()->IsWindowCompositingSupported()) {
    return 0;
  }
#endif
  if (controller && controller->use_ash_system_ui_layout()) {
    return controller->rounded_corners().has_value() ? 0
                                                     : touchable_corner_radius;
  }

  if (controller && (controller->IsCombobox() ||
                     (!use_bubble_border && controller->IsContextMenu()))) {
    return auxiliary_corner_radius;
  }
  return corner_radius;
}

bool MenuConfig::ShouldShowAcceleratorText(const MenuItemView* item,
                                           std::u16string* text) const {
  if (!show_accelerators || !item->GetDelegate() || !item->GetCommand()) {
    return false;
  }
  if (item->GetDelegate()->IsTearingDown()) {
    // The delegate should not be used once teardown has begun. Remove this once
    // crash root cause has been determined (crbug.com/1283454).
    base::debug::DumpWithoutCrashing();
    return false;
  }
  if (item->GetMenuController() && item->GetMenuController()->IsContextMenu()) {
    switch (item->GetCommand()) {
      case 33000:  // IDC_BACK
        *text = u"B";
        return true;
      case 33001:  // IDC_FORWARD
        *text = u"F";
        return true;
      case 33002:  // IDC_RELOAD
        *text = u"Ctrl+R";
        return true;
      case 35004:  // IDC_SAVE_PAGE
        *text = u"Ctrl+S";
        return true;
      case 35003:  // IDC_PRINT
        *text = u"Ctrl+P";
        return true;
      case 35011:  // IDC_ROUTE_MEDIA
        *text = u"C";
        return true;
      case 50161:  // IDC_CONTENT_CONTEXT_TRANSLATE
        *text = u"T";
        return true;
      case 35002:  // IDC_VIEW_SOURCE
      case 50181:  // IDC_CONTENT_CONTEXT_VIEWFRAMESOURCE
        *text = u"Ctrl+U";
        return true;
      case 50162:  // IDC_CONTENT_CONTEXT_INSPECTELEMENT
      case 50171:  // IDC_CONTENT_CONTEXT_INSPECTBACKGROUNDPAGE
        *text = u"N";
        return true;
      case 36000:  // IDC_CUT
      case 50151:  // IDC_CONTENT_CONTEXT_CUT
        *text = u"Ctrl+X";
        return true;
      case 36001:  // IDC_COPY
      case 50150:  // IDC_CONTENT_CONTEXT_COPY
        *text = u"Ctrl+C";
        return true;
      case 36002:
      case 36003:  // IDC_PASTE
      case 50152:  // IDC_CONTENT_CONTEXT_PASTE
        *text = u"Ctrl+V";
        return true;
      case 50156:  // IDC_CONTENT_CONTEXT_SELECTALL
        *text = u"Ctrl+A";
        return true;
      case 50154:  // IDC_CONTENT_CONTEXT_UNDO
        *text = u"Ctrl+Z";
        return true;
      case 50155:  // IDC_CONTENT_CONTEXT_REDO
        *text = u"Ctrl+Y";
        return true;
      default:
        break;
    }
  }
  ui::Accelerator accelerator;
  if (!item->GetDelegate()->GetAccelerator(item->GetCommand(), &accelerator)) {
    return false;
  }
  if (item->GetMenuController() && item->GetMenuController()->IsContextMenu() &&
      !show_context_menu_accelerators) {
    return false;
  }
  *text = accelerator.GetShortcutText();
  return true;
}

bool MenuConfig::ShouldUseBubbleBorderForMenu(
    const MenuController* controller) const {
  if (controller && (controller->use_ash_system_ui_layout() &&
                     CornerRadiusForMenu(controller))) {
    return true;
  }

  if (controller && (use_bubble_border && CornerRadiusForMenu(controller))) {
    return true;
  }

  return false;
}

void MenuConfig::InitCommon() {
  context_menu_font_list = font_list = TypographyProvider::Get().GetFont(
      style::CONTEXT_MENU, style::STYLE_BODY_3);
  reserve_dedicated_arrow_column = false;
  menu_horizontal_border_size = 0;
  submenu_horizontal_overlap = 0;
  item_vertical_margin = 3;
  item_horizontal_padding = 6;
  item_horizontal_border_padding = 6;
  rounded_menu_vertical_border_size = 5;
  arrow_size = 14;
  separator_height = 9;
  separator_upper_height = 3;
  separator_lower_height = 4;
  separator_spacing_height = 2;
  item_corner_radius = 5;
  use_outer_border = true;
  corner_radius = 10;
  auxiliary_corner_radius = 10;
  touchable_corner_radius = 10;
}

// static
const MenuConfig& MenuConfig::instance() {
  static base::NoDestructor<MenuConfig> instance;
  return *instance;
}

}  // namespace views
