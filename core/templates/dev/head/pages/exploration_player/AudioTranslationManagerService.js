oppia.factory('AudioTranslationManagerService',
  ['$modal', 'ExplorationPlayerStateService',
  function($modal, ExplorationPlayerStateService) {
    var _currentAudioLanguageCode = null;
    var _allLanguageCodesInExploration = null;

    var _init = function() {
      _allLanguageCodesInExploration =
        ExplorationPlayerStateService.getAllAudioLanguageCodes();
      console.log(_allLanguageCodesInExploration);
      if (_allLanguageCodesInExploration.length == 1) {
        _currentAudioLanguageCode = _allLanguageCodesInExploration[0];
      }
      if (_allLanguageCodesInExploration.length > 1) {
        _showPickLanguageModal();
      }
    };

    var _showPickLanguageModal = function() {
      $modal.open({
          templateUrl: 'modals/takeBreak',
          backdrop: 'static',
          resolve: {},
          controller: [
            '$scope', '$modalInstance', 'AudioTranslationManagerService',
            function($scope, $modalInstance, AudioTranslationManagerService) {
              $scope.okay = function() {
                $modalInstance.close('okay');
              };
            }]
        });
    };

    var _showAudioTranslationSettingsModal = function() {
      $modal.open({
        templateUrl: 'modals/audioTranslationSettings',
        resolve: {},
        controller: [
          '$scope', '$modalInstance','AudioTranslationManagerService',
          function($scope, $modalInstance, AudioTranslationManagerService) {
            $scope.selectedLanguage = _currentAudioLanguageCode;
            $scope.allLanguageCodes =
              AudioTranslationManagerService
                .getAllLanguageCodesInExploration();
            $scope.save = function() {
              $modalInstance.close({
                languageCode: $scope.selectedLanguage
              });
            };
          }
        ]
      }).result.then(function(result) {
        _currentAudioLanguageCode = result.languageCode;
      });
    };

    return {
      init: function() {
        _init();
      },
      getCurrentAudioLanguageCode: function() {
        return _currentAudioLanguageCode;
      },
      getAllLanguageCodesInExploration: function() {
        return _allLanguageCodesInExploration;
      },
      showAudioTranslationSettingsModal: function() {
        return _showAudioTranslationSettingsModal();
      }
    };
  }
]);

oppia.filter('languageDescriptions', [function() {
  var _getLanguageDescription = function(languageCode) {
    for (var i = 0; i < constants.ALL_LANGUAGE_CODES.length; i++) {
      if (constants.ALL_LANGUAGE_CODES[i].code === languageCode) {
        return constants.ALL_LANGUAGE_CODES[i].description;
      }
    }
  };
  return function(languageCodes) {
    var languageDescriptions = [];
    angular.forEach(languageCodes, function(languageCode) {
      languageDescriptions.push(_getLanguageDescription(languageCode));
    });
    return languageDescriptions;
  };
}]);
