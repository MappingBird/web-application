<div class="collection-header" ng-show="!showDeleteCollectionDialog">
    <a href="#" class="collection-name" ng-class="{ 'collection-name' : 1, 'active' : collectionsListVisible }" ng-click="showCollections($event)">
        <i class="icon-expand-collapse"></i>
        <span ng-bind="activeCollectionName"></span>
    </a>
    <span class="description"><span ng-bind="activeCollectionPointLength"></span> places saved</span>
    <!-- <a href="#" class="list-view pull-right" ng-class="{ 'active' : listMode }" ng-click="gotoListView($event)">List</a>
    <a href="#" class="map-view pull-right" ng-class="{ 'active' : !listMode }" ng-click="gotoMapView($event)">Map</a> -->
    <a href="#" class="list-view pull-right" ng-show="!listMode && activeCollectionPointLength != 0" ng-click="gotoListView($event)">SHOW LIST</a>
    <a href="#" class="list-view pull-right active" ng-show="listMode && activeCollectionPointLength != 0" ng-click="closeListView($event)">HIDE LIST</a>
    <div class="clearfix"></div>
</div>

<ul class="nav nav-stacked" ng-show="!showDeleteCollectionDialog" height-to-bottom m-custom-scrollbar="{scrollInertia: 0}">
    <!-- show collections[0] uncategorized collection -->
    <li ng-class="{active: collections[0].id == activeCollectionId}">
        <a href="#" class="collection" ng-click="clickCollection($event, collections[0].id, collections[0].name)">
            <span ng-bind="collections[0].name"></span> (<span ng-bind="collections[0].points.length || 0"></span>)
        </a>
        <li class="divider"></li>
    </li>
    <!-- show others collection -->
    <li ng-repeat="coll in collections" ng-class="{active: coll.id == activeCollectionId}" ng-show="$index != 0">
        <a href="#" ng-class="{collection: true, edit: editMode}" ng-click="clickCollection($event, coll.id, coll.name)">
            <span ng-bind="coll.name"></span> (<span ng-bind="coll.points.length || 0"></span>)
        </a>
    </li>
</ul>
<!-- Edit Button -->
<a href="#" class="btn-default pingismo-btn" ng-click="toggleEditMode($event)" id="edit-list-btn" ng-bind="editMode && 'Done' || 'Edit'" ng-show="!showDeleteCollectionDialog"></a>

<!-- Delete a collection -->
<div class="delete-collection-wrapper" ng-class="{visible: showDeleteCollectionDialog}">
    <h4>Delete "<i>[[deleteCollectionName]]</i>" permanently?</h4>
    Do you really want to delete this collection? Once you delete it, all places saved under this collection will be removed from your map forever.
    <div class="pin-content-footer">
        <hr />
        <a href="#" class="btn-risk pingismo-btn" ng-click="deleteCollection($event)">Yes, Delete It.</a>
        <a href="#" class="btn-default pingismo-btn" ng-click="unselectCollectionForDelete($event)">Cancel</a>
    </div>
</div>
