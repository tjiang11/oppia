// Copyright 2018 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Service to manage what audio translations are currently
 * being played or paused.
 */

oppia.factory('AudioTranslationManagerService', function() {  
  // Audio translations in the main conversation flow, such as those for
  // content and feedback.
  var _primaryAudioTranslations = null;
  var _primaryHtmlForAutogeneratedAudio = null;
  
  // Audio translations outside of the main conversation flow, such as
  // those for hints and solutions.
  var _secondaryAudioTranslations = null;
  var _secondaryHtmlForAutogeneratedAudio = null;

  return {
    setPrimaryAudioTranslations: function(audioTranslations, html) {
      _primaryAudioTranslations = audioTranslations;
      _primaryHtmlForAutogeneratedAudio = html;
    },
    setSecondaryAudioTranslations: function(audioTranslations, html) {
      _secondaryAudioTranslations = audioTranslations;
      _secondaryHtmlForAutogeneratedAudio = html;
    },
    clearSecondaryAudioTranslations: function() {
      _secondaryAudioTranslations = null;
      _secondaryHtmlForAutogeneratedAudio = null;
    },
    getCurrentAudioTranslations: function() {
      if (_secondaryAudioTranslations != null) {
        return _secondaryAudioTranslations;
      }
      return _primaryAudioTranslations;
    },
    getCurrentHtmlForAutogeneratedAudio: function() {
      if (_secondaryHtmlForAutogeneratedAudio != null) {
        return _secondaryHtmlForAutogeneratedAudio;
      }
      return _primaryHtmlForAutogeneratedAudio;
    }
  };
});
