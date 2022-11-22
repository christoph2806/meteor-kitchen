<a id="menu-item-simple" className={`ITEM_CLASS`} href="ITEM_LINK"><span id="item-icon" className="ICON_CLASS"></span> <span className="item-title">ITEM_TITLE</span></a>

<div id="menu-item-dropdown" className="btn-group" role="group">
	<a className={`dropdown-toggle ITEM_CLASS`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" href="ITEM_LINK"><span id="item-icon" className="ICON_CLASS"></span> <span className="item-title">ITEM_TITLE</span>&nbsp;<span className="caret"></span></a>

    <ul id="menu-items" className="dropdown-menu">
    </ul>
</div>

<li id="menu-item-collapse" className="menu-item-collapse ITEM_CLASS">
	<a href="#ITEM_ID" className="dropdown-toggle" data-toggle="collapse"><span id="item-icon" className="ICON_CLASS"></span> <span className="item-title">ITEM_TITLE</span> <b className="caret"></b></a>
	<div id="ITEM_ID" className="collapse">
		<ul id="menu-items" className="COMPONENT_CLASS">
		</ul>
	</div>
</li>
