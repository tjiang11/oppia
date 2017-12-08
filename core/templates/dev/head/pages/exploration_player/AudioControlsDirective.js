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

oppia.directive('audioControls', [
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
        'audio_controls_directive.html'),
      controller: [
        '$scope', 'AudioTranslationManagerService', 'AudioPlayerService',
        'LanguageUtilService', 'AssetsBackendApiService',
        'AutogeneratedAudioPlayerService', 'PlayerPositionService',
        function(
            $scope, AudioTranslationManagerService, AudioPlayerService,
            LanguageUtilService, AssetsBackendApiService,
            AutogeneratedAudioPlayerService, PlayerPositionService) {
          // This ID is passed in to AudioPlayerService as a means of
          // distinguishing which audio directive is currently playing audio.
          var directiveId = Math.random().toString(36).substr(2, 10);
          var audioRequestIsPending = false;

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

          $scope.audioIsLoading = false;

          $scope.IMAGE_URL_REWIND_AUDIO_BUTTON = (
            UrlInterpolationService.getStaticImageUrl(
              '/icons/rewind-five.svg'));

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
            if (isAutogeneratedLanguageCodeSelected()) {
              playPauseAutogeneratedAudioTranslation();
            } else {
              var audioTranslation = getAudioTranslationInCurrentLanguage();
              if (audioTranslation) {
                playPauseUploadedAudioTranslation(
                  getCurrentAudioLanguageCode());
              } else {
                // If the audio translation isn't available in the current
                // language, then open the settings modal.
                $scope.openAudioTranslationSettings();
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
            $scope.audioSettingsButtonIsShown = true;
            $scope.rewindButtonIsShown = false;
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
            $scope.audioSettingsButtonIsShown = true;
            $scope.rewindButtonIsShown = true;

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

          var onFinishedLoadingAudio = function(loadedFilename) {
            if (audioRequestIsPending &&
                loadedFilename === 
                  AudioPreloaderService
                    .getMostRecentlyRequestedAudioOnCurrentCard()) {
              audioRequestIsPending = false;
              AudioPlayerService.load(loadedFilename, directiveId)
                .then(function() {
                  AudioPlayerService.play();
                });
            }
            $scope.audioIsLoading = false;
          };

          AudioPreloaderService.setAudioLoadedCallback(onFinishedLoadingAudio);

          var loadAndPlayAudioTranslation = function() {
            $scope.audioIsLoading = true;
            audioRequestIsPending = true;
            var audioTranslation = getAudioTranslationInCurrentLanguage();
            AudioPreloaderService.setMostRecentlyRequestedAudioOnCurrentCard(
              audioTranslation.filename);
            if (audioTranslation) {
              if (isCached(audioTranslation)) {
                AudioPlayerService.load(
                  audioTranslation.filename, directiveId).then(function() {
                    $scope.audioIsLoading = false;
                    audioRequestIsPending = false;
                    AudioPlayerService.play();
                  });
              } else if (!AudioPreloaderService.isLoadingAudioFile(
                  audioTranslation.filename)) {
                AudioPreloaderService.restartAudioPreloader(
                  PlayerPositionService.getCurrentStateName());
              }
            }
          };

          $scope.rewindAudioFiveSec = function() {
            AudioPlayerService.rewind(5);
          };

          $scope.openAudioTranslationSettings = function() {
            AudioTranslationManagerService.showAudioTranslationSettingsModal(
              function(newLanguageCode) {
                if ($scope.isAudioAvailableInCurrentLanguage() &&
                    !isAutogeneratedLanguageCodeSelected()) {
                  $scope.audioIsLoading = true;
                  var audioTranslation =
                    getAudioTranslationInCurrentLanguage();
                  AudioPreloaderService
                    .setMostRecentlyRequestedAudioOnCurrentCard(
                      audioTranslation.filename);
                  AudioPreloaderService.restartAudioPreloader(
                    PlayerPositionService.getCurrentStateName());
                }
              });
          };
        }]
    }
  }
]);
