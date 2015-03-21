<div class="pin-content-wrapper" ng-show="showPointDetailPanel" ng-class="{ editable: pointEditMode}">
    <a href="#" ng-click="closePoint($event)" class="pingismo-proceed"><img src="/static/img/icon-proceed.png" /></a>
    <div class="pin-content">
        <div class="pin-details pull-left">
            Added: <span ng-bind="activeViewPoint.date_created"></span>
            <h4 ng-click="togglePointEditMode($event)" ng-bind="activeViewPoint.title" class="editable"></h4>
            <input type="text" ng-model="activeViewPoint.title" class="content-title" />
            <li class="btn-group pingismo-btn-group">
                <a class="btn exist" href="javascript:void(0);" ng-click="showSelectCollection = true" ng-show="!showSelectCollection"><span ng-bind="changeCollectionName"></span> <span class="caret"></span></a>
                <ul class="collections-menu thin-menu" ng-show="showSelectCollection" scrollbar-height-to-bottom>
                    <li ng-repeat="collection in collections"><a href="#" ng-click="selectPointCollection($event, collection.id)" title="[[collection.name]]" ng-bind="collection.name"></a></li>
                    <li class="input-append">
                        <input type="text" class="span2" id="appendedInputButton" ng-model="newCollectionName" placeholder="Create a new collection" />
                        <button class="btn" type="button" ng-click="saveNewCollection($event)">Create</button>
                    </li>
                </ul>
            </li>
            <ul class="types">
                <li ng-class="{active : activeViewPoint.type == 'scenicspot'}"><a href="#" class="types-scenicspot" ng-click="setPointType($event, 'scenicspot')"></a></li>
                <li ng-class="{active : activeViewPoint.type == 'hotel'}"><a href="#" class="types-hotel" ng-click="setPointType($event, 'hotel')"></a></li>
                <li ng-class="{active : activeViewPoint.type == 'mall'}"><a href="#" class="types-mall" ng-click="setPointType($event, 'mall')"></a></li>
                <li ng-class="{active : activeViewPoint.type == 'restaurant'}"><a href="#" class="types-restaurant" ng-click="setPointType($event, 'restaurant')"></a></li>
                <li ng-class="{active : activeViewPoint.type == 'bar'}"><a href="#" class="types-bar" ng-click="setPointType($event, 'bar')"></a></li>
                <li ng-class="{active : activeViewPoint.type == 'misc'}"><a href="#" class="types-misc" ng-click="setPointType($event, 'misc')"></a></li>
                <li class="collectionName">Under <span class="collection" ng-bind="activeCollectionName"></span></li>
            </ul>
            <a ng-href="[[activeViewPoint.url]]" class="ref-url ellipsis" title="[[activeViewPoint.url]]" new-window ng-bind="activeViewPoint.url"></a>
            <p class="ref-context editable" ng-click="togglePointEditMode($event)" ng-bind="activeViewPoint.description"></p>
            <textarea rows="8" ng-model="activeViewPoint.description"></textarea>
            <div height-to-bottom m-custom-scrollbar="{scrollInertia: 0, triggerEvent: 'placeImagesLoaded'}">
                <div class="ref-context-img" thumb-alignment="{displayArray: 'pointImages', selectArray: 'selectedPointImages', deselectArray: 'deselectedPointImages', enableLightbox: true, editMode: pointEditMode, onlyFirstSelected: false, whiteBackground: false}"></div>
            </div>
        </div>
        <!--
        <div class="pin-cover">
            <div class="cover-img">
                <img ng-src="[[activeViewPoint.images[0].url]]" />
                <p>Drag picture here to change cover photo</p>
            </div>
            <ul>
                <li class="collection" ng-bind="activeCollectionName"></li>
                <li class="btn-group pingismo-btn-group">
                    <a class="btn exist" href="javascript:void(0);" ng-click="showSelectCollection = true" ng-show="!showSelectCollection"><span ng-bind="changeCollectionName"></span> <span class="caret"></span></a>
                    <ul class="collections-menu thin-menu" ng-show="showSelectCollection" scrollbar-height-to-bottom>
                        <li ng-repeat="collection in collections"><a href="#" ng-click="selectPointCollection($event, collection.id)" title="[[collection.name]]" ng-bind="collection.name"></a></li>
                        <li class="input-append">
                            <input type="text" class="span2" id="appendedInputButton" ng-model="newCollectionName" placeholder="Create a new collection" />
                            <button class="btn" type="button" ng-click="saveNewCollection($event)">Create</button>
                        </li>
                    </ul>
                </li>
                <li>Added: <span ng-bind="activeViewPoint.date_created"></span></li>
                <li>
                    <ul class="types">
                        <li ng-class="{active : activeViewPoint.type == 'scenicspot'}"><a href="#" class="types-scenicspot" ng-click="setPointType($event, 'scenicspot')"></a></li>
                        <li ng-class="{active : activeViewPoint.type == 'hotel'}"><a href="#" class="types-hotel" ng-click="setPointType($event, 'hotel')"></a></li>
                        <li ng-class="{active : activeViewPoint.type == 'mall'}"><a href="#" class="types-mall" ng-click="setPointType($event, 'mall')"></a></li>
                        <li ng-class="{active : activeViewPoint.type == 'restaurant'}"><a href="#" class="types-restaurant" ng-click="setPointType($event, 'restaurant')"></a></li>
                        <li ng-class="{active : activeViewPoint.type == 'bar'}"><a href="#" class="types-bar" ng-click="setPointType($event, 'bar')"></a></li>
                        <li ng-class="{active : activeViewPoint.type == 'misc'}"><a href="#" class="types-misc" ng-click="setPointType($event, 'misc')"></a></li>
                        <div class=" clearfix"></div>
                    </ul>
                </li>
            </ul>
        </div>
        -->
    </div>
    <div class="pin-content-footer fixed">
        <hr />
        <a href="#" ng-click="togglePointEditMode($event)" class="btn-default pingismo-btn" id="edit-pin-content-btn">Edit</a>
        <a href="#" ng-click="savePointChanges($event)" class="btn-highlight pingismo-btn" id="done-edit-pin-content-btn">Done</a>
        <a href="#" ng-click="selectPointForDelete($event)" class="btn-default pingismo-btn pull-right" id="del-pin-content-btn">Delete This Place</a>
    </div>
</div>

<!-- Delete a Pin -->
<div class="delete-pin-wrapper" ng-class="{visible: showDeletePoint}">
    <h4 ng-bind="activeViewPoint.title"></h4>
    Do you really want to delete this place permanently? Once you delete it, it will be removed from your map forever.
    <div class="pin-content-footer">
        <hr />
        <a href="#" class="btn-risk pingismo-btn" id="delete-pin-btn" ng-click="deletePoint($event)">Yes, Delete It.</a>
        <a href="#" class="btn-default pingismo-btn" id="cancel-delete-pin-btn" ng-click="unselectPointForDelete($event)">Cancel</a>
    </div>
    <p ng-show="pointDeletError">There was an error deleting this point.</p>
</div>
<!-- End of delete a Pin -->