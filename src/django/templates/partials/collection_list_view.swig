<!-- Old template -->
<!-- <div class="list-item" ng-repeat="point in activeViewPoints">
    <div class="item-header">
        <p class="item-pin [[point.type]]" ng-bind="point.type"></p>
        <p class="item-title" title="[[point.title]]" ng-bind="point.title"></p>
        <p class="item-time-added"><span class="icon-clock"></span> <span ng-bind="point.create_time | amCalendar"></span></p>
    </div>
    <div class="item-body">
        <img ng-src="[[point.images[0].url]]">
        <p class="item-description" ng-bind="point.description"></p>
    </div>
</div> -->

<!-- New Listview Template -->
<ul class="collection-listview" height-to-bottom m-custom-scrollbar="{scrollInertia: 0}">
	<li ng-class="{'isSelected': isSelected==point.id }" class="list-item" ng-repeat="point in activeViewPoints | orderBy: '-point.created_time'" ng-click="popupPin($event, [[point.id]])" ng-mouseover="offsetMapWhenHover($event, [[point.id]], [[point.lat]], [[point.lng]])">
		<div class="item-wrapper">
			<img class="thumbnail" ng-src="[[point.images[0].url]]"/>
			<div class="context"><span>Added: [[point.update_time | amTimeAgo]]</span>[[point.title]]
				<!-- <ul class="tags">
					<li>Free-WIFI</li>
					<li>Coffee-shop</li>
					<li>Socket</li>
					<li>Pasta</li>
					<div class="clearfix"></div>
				</ul> -->
			</div>
			<div class="clearfix"></div>
		</div>
	</li>
</ul>
