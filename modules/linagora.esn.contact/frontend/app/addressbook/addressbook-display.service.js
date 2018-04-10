(function(angular) {
  'use strict';

  angular.module('linagora.esn.contact')
    .factory('contactAddressbookDisplayService', contactAddressbookDisplayService);

  function contactAddressbookDisplayService(
    _,
    contactAddressbookDisplayShellRegistry,
    ContactAddressbookDisplayShell
  ) {
    return {
      convertShellToDisplayShell: convertShellToDisplayShell,
      convertShellsToDisplayShells: convertShellsToDisplayShells,
      categorizeDisplayShells: categorizeDisplayShells,
      sortAddressbookDisplayShells: sortAddressbookDisplayShells,
      buildDisplayName: buildDisplayName
    };

    function convertShellsToDisplayShells(addressbookShells, options) {
      options = options || {};

      return addressbookShells.map(function(addressbookShell) {
        return convertShellToDisplayShell(addressbookShell, options);
      });
    }

    function convertShellToDisplayShell(addressbookShell, options) {
      options = options || {};
      var match = _getMatchingDisplayShell(addressbookShell);

      if (match) {
        var addressbookDisplayShell = new match.displayShell(addressbookShell);

        if (options.includeActions) {
          addressbookDisplayShell.actions = match.actions || [];
        }

        if (options.includePriority) {
          addressbookDisplayShell.priority = match.priority;
        }

        return addressbookDisplayShell;
      }

      return new ContactAddressbookDisplayShell(addressbookShell);
    }

    function sortAddressbookDisplayShells(addressbookDisplayShells) {
      return addressbookDisplayShells.sort(_sortByPriority);
    }

    function buildDisplayName(addressbook) {
      var matchedShell = _.find(_getRegisteredDisplayShells(), function(shell) {
        return shell.matchingFunction(addressbook);
      });

      if (matchedShell) {
        return new matchedShell.displayShell(addressbook).displayName;
      }

      return addressbook.name || addressbook.bookName;
    }

    function categorizeDisplayShells(displayShells) {
      var userAddressbooks = displayShells.filter(function(displayShell) {
        return !displayShell.shell.isSubscription();
      }).sort(_sortByPriority);

      var sharedAddressbooks = displayShells.filter(function(displayShell) {
        return displayShell.shell.isSubscription();
      }).sort(_sortByOwnerSubscription);

      return {
        userAddressbooks: userAddressbooks,
        sharedAddressbooks: sharedAddressbooks
      };
    }

    function _sortByPriority(displayShell1, displayShell2) {
      if (displayShell1.priority === displayShell2.priority) {
        return displayShell1.displayName.localeCompare(displayShell2.displayName);
      }

      return displayShell1.priority - displayShell2.priority;
    }

    function _sortByOwnerSubscription(subscription1, subscription2) {
      if (subscription1.shell.owner.displayName && subscription2.shell.owner.displayName) {
        return subscription1.shell.owner.displayName.localeCompare(subscription2.shell.owner.displayName);
      }
    }

    function _getMatchingDisplayShell(addressbook) {
      var context = addressbook.isSubscription() ? addressbook.source : addressbook;

      return _.find(_getRegisteredDisplayShells(), function(displayShell) {
        return displayShell.matchingFunction(context);
      });
    }

    function _getRegisteredDisplayShells() {
      return _.values(contactAddressbookDisplayShellRegistry.getAll());
    }
  }
})(angular);