<div class="collection-header">
    <a href="#" class="collection-name" ng-class="{ 'collection-name' : 1, 'active' : collectionsListVisible }" ng-click="showCollections($event)">
        <i class="icon-expand-collapse"></i>
        <span ng-bind="activeCollectionName"></span>
    </a>
    <span class="description"><span ng-bind="activeCollectionPointLength"></span> places saved</span>
    <a href="#" class="list-view pull-right" ng-class="{ 'active' : listMode }" ng-click="gotoListView($event)">List</a>
    <a href="#" class="map-view pull-right" ng-class="{ 'active' : !listMode }" ng-click="gotoMapView($event)">Map</a>
    <div class="clearfix"></div>
</div>

<ul class="nav nav-stacked" ng-show="!showDeleteCollectionDialog">
    <li ng-repeat="coll in collections" ng-class="{active: coll.id == activeCollectionId}"><a href="#" ng-class="{collection: true, edit: editMode}" ng-click="clickCollection($event, coll.id, coll.name)"><span ng-bind="coll.name"></span> (<span ng-bind="coll.points.length || 0"></span>)</a></li>
    <li class="divider"></li>
    <li><a href="#" class="btn-default pingismo-btn" ng-click="toggleEditMode($event)" id="edit-list-btn" ng-bind="editMode && 'Done' || 'Edit'"></a></li>
</ul>

<!-- Delete a collection -->
<div class="delete-collection-wrapper" ng-class="{visible: showDeleteCollectionDialog}">
    <h4 ng-bind="deleteCollectionName"></h4>
    Do you really want to delete this collection? Once you delete it, all places saved under this collection will be removed from your map forever.
    <div class="pin-content-footer">
        <hr />
        <a href="#" class="btn-risk pingismo-btn" ng-click="deleteCollection($event)">Yes, Delete It.</a>
        <a href="#" class="btn-default pingismo-btn" ng-click="unselectCollectionForDelete($event)">Cancel</a>
    </div>
</div>