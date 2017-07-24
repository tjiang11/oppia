oppia.factory('LanguageManagerService',
  ['$modal', 'ExplorationPlayerStateService',
  function($modal, ExplorationPlayerStateService) {
    var currentAudioLanguageCode = null;
    var allLanguageCodesInExploration = null;

    var _init = function() {
      allLanguageCodesInExploration =
        ExplorationPlayerStateService.getAllAudioLanguageCodes();
      console.log('all');
      console.log(allLanguageCodesInExploration);
      if (allLanguageCodesInExploration.length == 1) {
        currentAudioLanguageCode = allLanguageCodesInExploration[0];
      }
      if (allLanguageCodesInExploration.length > 1) {
        showPickLanguageModal();
      }
    };

    var showPickLanguageModal = function() {
      $modal.open({
          templateUrl: 'modals/takeBreak',
          backdrop: 'static',
          resolve: {},
          controller: [
            '$scope', '$modalInstance',
            function($scope, $modalInstance) {
              $scope.okay = function() {
                $modalInstance.close('okay');
              };
            }]
        });
    };

    return {
      init: function() {
        _init();
      }
    };
  }
]);
