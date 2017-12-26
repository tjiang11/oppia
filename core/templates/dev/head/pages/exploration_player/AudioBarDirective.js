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
 * @fileoverview Directive for a set of audio controls for a specific
 * audio translation in the learner view.
 */

oppia.directive('audioBar', [
  'UrlInterpolationService', 'AudioPreloaderService',
  function(UrlInterpolationService, AudioPreloaderService) {
    return {
      restrict: 'E',
      scope: {
        getAudioTranslations: '&audioTranslations',
        getContentHtml: '&contentHtml'
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration_player/' +
        'audio_bar_directive.html'),
      controller: [
        '$scope', '$interval', 'AudioTranslationManagerService', 'AudioPlayerService',
        'LanguageUtilService', 'AssetsBackendApiService',
        'AutogeneratedAudioPlayerService', 'PlayerPositionService',
        'WindowDimensionsService', 'EVENT_ACTIVE_CARD_CHANGED',
        function(
            $scope, $interval, AudioTranslationManagerService, AudioPlayerService,
            LanguageUtilService, AssetsBackendApiService,
            AutogeneratedAudioPlayerService, PlayerPositionService,
            WindowDimensionsService, EVENT_ACTIVE_CARD_CHANGED) {
          // This ID is passed in to AudioPlayerService as a means of
          // distinguishing which audio directive is currently playing audio.
          var directiveId = Math.random().toString(36).substr(2, 10);

          $scope.isAudioBarExpanded = false;
          $scope.hasPressedPlayButtonOnce = false;

          $scope.AudioTranslationManagerService = AudioTranslationManagerService;
          $scope.languagesInExploration = AudioTranslationManagerService.getLanguageOptionsForDropdown();
          $scope.selectedLanguage = {
            value: AudioTranslationManagerService.getCurrentAudioLanguageCode()
          };

          $scope.$on(EVENT_ACTIVE_CARD_CHANGED, function() {
            if ($scope.isAudioBarExpanded) {
              $scope.onSpeakerIconClicked();
            }
          });

          $scope.languageSelected = function() {
            AudioTranslationManagerService.setCurrentAudioLanguageCode(
              $scope.selectedLanguage.value);
            AudioPlayerService.stop();
            AudioPlayerService.clear();
            AutogeneratedAudioPlayerService.cancel();
            if ($scope.isAudioAvailableInCurrentLanguage() &&
                !isAutogeneratedLanguageCodeSelected()) {
              var audioTranslation =
                getAudioTranslationInCurrentLanguage();
              AudioPreloaderService.setMostRecentlyRequestedAudioFilename(
                audioTranslation.filename);
              AudioPreloaderService.restartAudioPreloader(
                PlayerPositionService.getCurrentStateName());
            }
          };

          $scope.expandAudioBar = function() {
            $scope.isAudioBarExpanded = true;
            AudioPlayerService.activate();
          };

          $scope.collapseAudioBar = function() {
            $scope.isAudioBarExpanded = false;
            AudioPlayerService.stop();
            AudioPlayerService.clear();
            AutogeneratedAudioPlayerService.cancel();
            AudioPlayerService.deactivate();
          };

          $scope.IMAGE_URL_EXPAND_AUDIO_BUTTON = (
            UrlInterpolationService.getStaticImageUrl(
              '/general/audio_expand.png'));

          $scope.IMAGE_URL_COLLAPSE_AUDIO_BUTTON = (
            UrlInterpolationService.getStaticImageUrl(
              '/general/audio_collapse.png'));

          var hasScrolled = false;
          var lastScrollTop = 0;

          $(window).scroll(function(event) {
            hasScrolled = true;
          });

          $interval(function() {
            if (hasScrolled && WindowDimensionsService.isWindowNarrow()) {
              updateAudioHeaderPosition();
              hasScrolled = false;
            }
          }, 100);

          var updateAudioHeaderPosition = function() {
            var scrollTop = $(this).scrollTop();
            var audioHeader = angular.element(document.querySelector('.audio-header'));
            if (scrollTop > lastScrollTop) {
              audioHeader.addClass('nav-up');
            } else {
              if (scrollTop + $(window).height() < $(document).height()) {
                audioHeader.removeClass('nav-up');
              }
            }
            lastScrollTop = scrollTop;
          };

          var getCurrentAudioLanguageCode = function() {
            return AudioTranslationManagerService.getCurrentAudioLanguageCode();
          };

          $scope.getCurrentAudioLanguageDescription = function() {
            return AudioTranslationManagerService
              .getCurrentAudioLanguageDescription();
          };

          var getAudioTranslationInCurrentLanguage = function() {
            return $scope.getAudioTranslations()[
              AudioTranslationManagerService.getCurrentAudioLanguageCode()];
          };

          $scope.isAudioPlaying = function() {
            return AudioPlayerService.isPlaying() ||
              AutogeneratedAudioPlayerService.isPlaying();
          };

          $scope.audioLoadingIndicatorIsShown = false;

          $scope.AudioPlayerService = AudioPlayerService;

          $scope.isAudioAvailableInCurrentLanguage = function() {
            return Boolean(getAudioTranslationInCurrentLanguage()) ||
              isAutogeneratedLanguageCodeSelected();
          };

          $scope.doesCurrentAudioTranslationNeedUpdate = function() {
            if (!isAutogeneratedLanguageCodeSelected()) {
              return getAudioTranslationInCurrentLanguage().needsUpdate;
            } else {
              return false;
            }
          };

          var isAutogeneratedLanguageCodeSelected = function() {
            return AudioTranslationManagerService
              .isAutogeneratedLanguageCodeSelected();
          };

          $scope.onSpeakerIconClicked = function() {
            $scope.hasPressedPlayButtonOnce = true;
            if (isAutogeneratedLanguageCodeSelected()) {
              playPauseAutogeneratedAudioTranslation();
            } else {
              var audioTranslation = getAudioTranslationInCurrentLanguage();
              if (audioTranslation) {
                playPauseUploadedAudioTranslation(
                  getCurrentAudioLanguageCode());
              }
            }
          };

          var isCached = function(audioTranslation) {
            return AssetsBackendApiService.isCached(audioTranslation.filename);
          };

          var playPauseAudioTranslation = function(languageCode) {
            if (AudioTranslationManagerService
              .isAutogeneratedLanguageCodeSelected()) {
              playPauseAutogeneratedAudioTranslation();
            } else {
              playPauseUploadedAudioTranslation(languageCode);
            }
          };

          var playPauseAutogeneratedAudioTranslation = function() {
            // SpeechSynthesis in Chrome seems to have a bug
            // where if you pause the utterance, wait for around
            // 15 or more seconds, then try resuming, nothing
            // will sound. As a temporary fix, just restart the
            // utterance from the beginning instead of resuming.
            if (AutogeneratedAudioPlayerService.isPlaying()) {
              AutogeneratedAudioPlayerService.cancel();
            } else {
              AutogeneratedAudioPlayerService.play(
                $scope.getContentHtml(),
                AudioTranslationManagerService.getSpeechSynthesisLanguageCode(),
                function() {
                  // Used to update bindings to show a silent speaker after
                  // autogenerated audio has finished playing.
                  $scope.$apply();
                });
            }
          };

          var playPauseUploadedAudioTranslation = function(languageCode) {
            if (!AudioPlayerService.isPlaying()) {
              if (AudioPlayerService.isTrackLoaded() &&
                  isRequestForSameAudioAsLastTime()) {
                AudioPlayerService.play();
              } else {
                loadAndPlayAudioTranslation();
              }
            } else {
              AudioPlayerService.pause();
              if (!isRequestForSameAudioAsLastTime()) {
                // After pausing the currently playing audio,
                // immediately start playing the newly requested audio.
                loadAndPlayAudioTranslation();
              }
            }
          };

          var isRequestForSameAudioAsLastTime = function() {
            return directiveId ===
              AudioPlayerService.getCurrentAudioControlsDirectiveId();
          };

          var playCachedAudioTranslation = function(
            audioFilename, directiveId) {
            AudioPlayerService.load(audioFilename, directiveId)
              .then(function() {
                $scope.audioLoadingIndicatorIsShown = false;
                AudioPlayerService.play();
              });
          };

          /**
           * Called when an audio file finishes loading.
           * @param {string} audioFilename - Filename of the audio file that
           *                                 finished loading.
           */
          var onFinishedLoadingAudio = function(audioFilename) {
            var mostRecentlyRequestedAudioFilename =
              AudioPreloaderService.getMostRecentlyRequestedAudioFilename();
            if ($scope.audioLoadingIndicatorIsShown &&
                audioFilename === mostRecentlyRequestedAudioFilename) {
              playCachedAudioTranslation(audioFilename, directiveId);
            }
          };

          AudioPreloaderService.setAudioLoadedCallback(onFinishedLoadingAudio);

          var loadAndPlayAudioTranslation = function() {
            $scope.audioLoadingIndicatorIsShown = true;
            var audioTranslation = getAudioTranslationInCurrentLanguage();
            AudioPreloaderService.setMostRecentlyRequestedAudioFilename(
              audioTranslation.filename);
            if (audioTranslation) {
              if (isCached(audioTranslation)) {
                playCachedAudioTranslation(
                  audioTranslation.filename, directiveId);
              } else if (!AudioPreloaderService.isLoadingAudioFile(
                  audioTranslation.filename)) {
                AudioPreloaderService.restartAudioPreloader(
                  PlayerPositionService.getCurrentStateName());
              }
            }
          };
        }]
    }
  }
]);
