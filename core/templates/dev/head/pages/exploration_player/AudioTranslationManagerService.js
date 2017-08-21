// Copyright 2017 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Service to manage the current language being
 * used for audio translations.
 */

oppia.factory('AudioTranslationManagerService', [
  '$modal', 'AudioPlayerService', 'UrlInterpolationService',
  'LanguageUtilService',
  function(
      $modal, AudioPlayerService, UrlInterpolationService,
      LanguageUtilService) {
    var _currentAudioLanguageCode = null;
    var _allAudioLanguageCodesInExploration = null;
    var _explorationLanguageCode = null;

    var attemptToSetAudioLanguageToExplorationLanguage = function() {
      // We minimize the number of related languages, because we want to
      // pick the language that is the most directly related to the exploration
      // language . For example, this would prioritize Hindi over Hinglish
      // if both were available as audio languages.
      var numRelatedLanguages = Number.MAX_VALUE;
      _allAudioLanguageCodesInExploration.map(function(audioLanguageCode) {
        var relatedLanguageCodes =
          LanguageUtilService.getLanguageCodesRelatedToAudioLanguageCode(
            audioLanguageCode);
        relatedLanguageCodes.map(function(relatedLanguageCode) {
          if (relatedLanguageCode === _explorationLanguageCode) {
            if (relatedLanguageCodes.length < numRelatedLanguages) {
              _currentAudioLanguageCode = audioLanguageCode;
              numRelatedLanguages = relatedLanguageCodes.length;
            }
          }
        });
      });
      return _currentAudioLanguageCode !== null;
    };

    var _init = function(
      allAudioLanguageCodesInExploration, preferredAudioLanguageCode,
      explorationLanguageCode) {
      _allAudioLanguageCodesInExploration = allAudioLanguageCodesInExploration;
      _explorationLanguageCode = explorationLanguageCode;

      if (preferredAudioLanguageCode &&
          allAudioLanguageCodesInExploration.indexOf(
            preferredAudioLanguageCode) !== -1) {
        _currentAudioLanguageCode = preferredAudioLanguageCode;
      }

      if (_currentAudioLanguageCode === null) {
        attemptToSetAudioLanguageToExplorationLanguage();
      }

      if (_currentAudioLanguageCode === null &&
          _allAudioLanguageCodesInExploration.length >= 1) {
        _currentAudioLanguageCode = _allAudioLanguageCodesInExploration[0];
      }
    };

    var _showAudioTranslationSettingsModal = function(
        onLanguageChangedCallback) {
      $modal.open({
        templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
          '/pages/exploration_player/' +
          'audio_translation_settings_modal_directive.html'),
        resolve: {},
        backdrop: true,
        controller: [
          '$scope', '$filter', '$modalInstance',
          'AudioTranslationManagerService', 'LanguageUtilService',
          function(
              $scope, $filter, $modalInstance,
              AudioTranslationManagerService, LanguageUtilService) {
            var allLanguageCodes =
              AudioTranslationManagerService
                .getallAudioLanguageCodesInExploration();

            $scope.languagesInExploration = [];

            allLanguageCodes.map(function(languageCode) {
              var languageDescription =
                LanguageUtilService.getAudioLanguageDescription(languageCode);
              $scope.languagesInExploration.push({
                value: languageCode,
                displayed: languageDescription
              });
            });

            $scope.selectedLanguage = _currentAudioLanguageCode;
            $scope.save = function() {
              $modalInstance.close({
                languageCode: $scope.selectedLanguage
              });
            };
          }
        ]
      }).result.then(function(result) {
        if (_currentAudioLanguageCode !== result.languageCode) {
          _currentAudioLanguageCode = result.languageCode;
          AudioPlayerService.stop();
          AudioPlayerService.clear();
          if (onLanguageChangedCallback) {
            onLanguageChangedCallback(_currentAudioLanguageCode);
          }
        }
      });
    };

    return {
      init: function(
        allAudioLanguageCodesInExploration, preferredAudioLanguageCode, 
        explorationLanguageCode) {
        _init(allAudioLanguageCodesInExploration, preferredAudioLanguageCode,
          explorationLanguageCode);
      },
      getCurrentAudioLanguageCode: function() {
        return _currentAudioLanguageCode;
      },
      getCurrentAudioLanguageDescription: function() {
        return LanguageUtilService.getAudioLanguageDescription(
          _currentAudioLanguageCode);
      },
      getallAudioLanguageCodesInExploration: function() {
        return _allAudioLanguageCodesInExploration;
      },
      showAudioTranslationSettingsModal: function(onLanguageChangedCallback) {
        _showAudioTranslationSettingsModal(onLanguageChangedCallback);
      },
      clearCurrentAudioLanguageCode: function() {
        _currentAudioLanguageCode = null;
      }
    };
  }]);
