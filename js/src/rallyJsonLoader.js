//
//  HTML5 PivotViewer
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

//JSON loader
PivotViewer.Models.Loaders.JSONLoader = PivotViewer.Models.Loaders.ICollectionLoader.subClass({
    init: function (JSONUri, proxy) {
        this.JSONUriNoProxy = JSONUri;
        if (proxy)
            this.JSONUri = proxy + JSONUri;
        else 
            this.JSONUri = JSONUri;
    },
    LoadCollection: function (collection) {
        this.collection = collection;
        this.collection.CollectionBaseNoProxy = this.JSONUriNoProxy;
        this.collection.CollectionBase = this.JSONUri;

        var myRequest = new XMLHttpRequest();

        myRequest.withCredentials = true;
        myRequest.open('GET', this.JSONUri);
        myRequest.context = this;
        myRequest.onreadystatechange = function () {
            if (this.status == 200 && this.readyState == 4) {
                this.context.JSONLoaded($.parseJSON(this.responseText));
            }
            else if(this.status != 200){
                this.context.JSONLoadFailed(this);
            }
        };
        myRequest.send();

    },
    _hydrateCollections: function(data){

        data = data.QueryResult;
        data.CollectionName = 'Artifacts in Kumquats';
        data.FacetCategories = {
            "FacetCategory": [
                {
                    "Name": "Name",
                    "Type": "String",
                    "IsWordWheelVisible": "true",
                    "IsFilterVisible": "true"
                },
                {
                    "Name": "Creation Date",
                    "Type": "DateTime",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Workspace",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Subscription",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Expedite",
                    "Type": "Boolean",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Defect Status",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Blocked",
                    "Type": "Boolean",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Schedule State",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Ready",
                    "Type": "Boolean",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Accepted Date",
                    "Type": "DateTime",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Type",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "FormattedID",
                    "Type": "String",
                    "IsFilterVisible": "false",
                    "IsMetaDataVisible" : "false"
                }
            ]
        };

        data.Items = {
            ImgBase: location.origin+'/rallypivotviewer/images',
            Item: []
        };

        this.totalItems = data.Results.length-1;
        this.itemsLoaded = 0;

        for(var i=0; i<this.totalItems; i++){
            var myRequest = new XMLHttpRequest();
            var currentItem = data.Results[i];
            myRequest.withCredentials = true;
            myRequest.open('GET', currentItem._ref);
            myRequest.context = this;
            myRequest.onreadystatechange = function () {
                if (this.status == 200 && this.readyState == 4 && this.context.itemsLoaded != this.context.totalItems) {
                    this.context._loadNextArtifact($.parseJSON(this.responseText), data, this.context.itemsLoaded);
                }
                else if(this.status != 200){
                    this.context.JSONLoadFailed(this);
                }
            };
            myRequest.send();
        }
    },

    _loadNextArtifact: function(newData, data, newId){

        var currentType;

        if(newData.HierarchicalRequirement){
            newData = newData.HierarchicalRequirement;
            currentType = "User Story";
        }
        if(newData.Defect){
            newData = newData.Defect;
            currentType = "Defect";
        }

        var item = {};
        item.Name = newData.Name;
        item.Description = newData.Description;
        item.Extension = "\n\t";
        item.Id = newId;
        item.Img= currentType === 'Defect' ? 'defect.jpg' : 'userStory.jpg';
        item.Href='https://rally1.rallydev.com/#/'+currentProject+"/detail/"+currentType+"/"+newData.ObjectID;

        item.Facets = {
            Facet: []
        };

        item.Facets.Facet.push(
            {
                "String": {
                    "Value": newData.Subscription ? newData.Subscription._refObjectName : ""
                },
                "Name": "Subscription"
            },
            {
                "String": {
                    "Value": newData.Name ? newData.Name : ""
                },
                "Name": "Name"
            },
            {
                "String": {
                    "Value": newData.Workspace ? newData.Workspace._refObjectName : ""
                },
                "Name": "Workspace"
            },
            {
                "Boolean": {
                    "Value": newData.Expedite ? newData.Expedite : ""
                },
                "Name": "Expedite"
            },
            {
                "String": {
                    "Value": newData.DefectStatus ? newData.DefectStatus : ""
                },
                "Name": "Defect Status"
            },
            {
                "DateTime": {
                    "Value": newData.CreationDate ? newData.CreationDate : ""
                },
                "Name": "Creation Date"
            },
            {
                "Boolean": {
                    "Value": newData.Blocked ? newData.Blocked : ""
                },
                "Name": "Blocked"
            },
            {
                "String": {
                    "Value": newData.ScheduleState ? newData.ScheduleState : ""
                },
                "Name": "Schedule State"
            },
            {
                "String":{
                    "Value": currentType
                },
                "Name": "Type"
            },
            {
                "DateTime":{
                    "Value": newData.AcceptedDate ? newData.AcceptedDate : ""
                },
                "Name": "Accepted Date"
            },
            {
                "Boolean": {
                    "Value": newData.Ready ? newData.Ready : ""
                },
                "Name": "Ready"
            },
            {
                "String":{
                    "Value": newData.FormattedID ? newData.FormattedID : ""
                },
                "Name": "FormattedID"
            }
        );

        data.Items.Item.push(item);
        this.itemsLoaded++;

        if(this.itemsLoaded === this.totalItems){
            this._continueLoad(data);
        }

    },

    _continueLoad: function(data){
        if (data.FacetCategories == undefined || data.Items == undefined) {
            //Make sure throbber is removed else everyone thinks the app is still running
            $('.pv-loading').remove();

            //Display message so the user knows something is wrong
            var msg = '';
            msg = msg + 'Error parsing CXML Collection<br>';
            msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
            $('.pv-wrapper').append("<div id=\"pv-parse-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
            var t=setTimeout(function(){window.open("#pv-parse-error","_self")},1000)
            throw "Error parsing CXML Collection";
        }

        if (data.CollectionName != undefined)
            this.collection.CollectionName = data.CollectionName;

        if (data.BrandImage != undefined)
            this.collection.BrandImage = data.BrandImage;

        //FacetCategories
        for (var i = 0; i < data.FacetCategories.FacetCategory.length; i++) {

            var facetCategory = new PivotViewer.Models.FacetCategory(
                data.FacetCategories.FacetCategory[i].Name,
                data.FacetCategories.FacetCategory[i].Format,
                data.FacetCategories.FacetCategory[i].Type,
                data.FacetCategories.FacetCategory[i].IsFilterVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsFilterVisible.toLowerCase() == "true" ? true : false) : true,
                data.FacetCategories.FacetCategory[i].IsMetadataVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsMetadataVisible.toLowerCase() == "true" ? true : false) : true,
                data.FacetCategories.FacetCategory[i].IsWordWheelVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsWordWheelVisible.toLowerCase() == "true" ? true : false) : true
            );

            if (data.FacetCategories.FacetCategory[i].SortOrder != undefined) {
                var customSort = new PivotViewer.Models.FacetCategorySort(data.FacetCategories.FacetCategory[i].SortOrder.Name);
                for (j = 0; j < data.FacetCategories.FacetCategory[i].SortValues.Value.length; J++)
                    customSort.Values.push(data.FacetCategories.FacetCategory[i].SortValues.Value[j]);
                facetCategory.CustomSort = customSort;
            }

            this.collection.FacetCategories.push(facetCategory);
        }

        if (data.Items.ImgBase != undefined) this.collection.ImageBase = data.Items.ImgBase;

        // Item
        if (data.Items.Item.length == 0) {

            //Make sure throbber is removed else everyone thinks the app is still running
            $('.pv-loading').remove();

            //Display a message so the user knows something is wrong
            var msg = '';
            msg = msg + 'There are no items in the CXML Collection<br><br>';
            $('.pv-wrapper').append("<div id=\"pv-empty-collection-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
            var t=setTimeout(function(){window.open("#pv-empty-collection-error","_self")},1000)
        } else {
            for (var i = 0; i < data.Items.Item.length; i++) {
                var item = new PivotViewer.Models.Item(
                    data.Items.Item[i].Img.replace("#", ""),
                    data.Items.Item[i].Id,
                    data.Items.Item[i].Href,
                    data.Items.Item[i].Name
                );

                item.Description = PivotViewer.Utils.HtmlSpecialChars(data.Items.Item[i].Description);

                for (j = 0; j < data.Items.Item[i].Facets.Facet.length; j++) {
                    var values = [];
                    if (data.Items.Item[i].Facets.Facet[j].Number != undefined) {
                        if ( data.Items.Item[i].Facets.Facet[j].Number.length > 0) {
                            for (k = 0; k < data.Items.Item[i].Facets.Facet[j].Number.length; k++) {
                                var value = new PivotViewer.Models.FacetValue(parseFloat(data.Items.Item[i].Facets.Facet[j].Number[k].Value));
                                values.push(value);
                            }
                        } else {
                            var value = new PivotViewer.Models.FacetValue(parseFloat(data.Items.Item[i].Facets.Facet[j].Number.Value));
                            values.push(value);
                        }
                    } else if (data.Items.Item[i].Facets.Facet[j].Link != undefined) {
                        for (k = 0; k < data.Items.Item[i].Facets.Facet[j].Link.length; k++) {
                            var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].Link[k].Name);
                            value.Href = data.Items.Item[i].Facets.Facet[j].Link[k].Href;
                            values.push(value);
                        }
                    } else if (data.Items.Item[i].Facets.Facet[j].String != undefined) {
                        if ( data.Items.Item[i].Facets.Facet[j].String.length > 0) {
                            for (k = 0; k < data.Items.Item[i].Facets.Facet[j].String.length; k++) {
                                var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].String[k].Value);
                                values.push(value);
                            }
                        } else {
                            var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].String.Value);
                            values.push(value);
                        }
                    } else if (data.Items.Item[i].Facets.Facet[j].LongString != undefined) {
                        if ( data.Items.Item[i].Facets.Facet[j].LongString.length > 0) {
                            for (k = 0; k < data.Items.Item[i].Facets.Facet[j].LongString.length; k++) {
                                var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].LongString[k].Value);
                                values.push(value);
                            }
                        } else {
                            var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].LongString.Value);
                            values.push(value);
                        }
                    } else if (data.Items.Item[i].Facets.Facet[j].DateTime != undefined) {
                        if ( data.Items.Item[i].Facets.Facet[j].DateTime.length > 0) {
                            for (k = 0; k < data.Items.Item[i].Facets.Facet[j].DateTime.length; k++) {
                                var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].DateTime[k].Value);
                                values.push(value);
                            }
                        } else {
                            var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].DateTime.Value);
                            values.push(value);
                        }
                    } else if(data.Items.Item[i].Facets.Facet[j].Boolean != undefined){
                        if ( data.Items.Item[i].Facets.Facet[j].Boolean.length > 0) {
                            for (k = 0; k < data.Items.Item[i].Facets.Facet[j].Boolean.length; k++) {
                                var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].Boolean[k].Value);
                                values.push(value);
                            }
                        } else {
                            var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].Boolean.Value);
                            values.push(value);
                        }
                    } else { // Unexpected data type

                        //Make sure throbber is removed else everyone thinks the app is still running
                        $('.pv-loading').remove();

                        //Display a message so the user knows something is wrong
                        var msg = '';
                        msg = msg + 'Error parsing the CXML Collection:<br>Unrecognised facet value type<br>';
                        $('.pv-wrapper').append("<div id=\"pv-parse-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                        var t=setTimeout(function(){window.open("#pv-parse-error","_self")},1000)
                    }

                    var facet = new PivotViewer.Models.Facet (
                        data.Items.Item[i].Facets.Facet[j].Name,
                        values
                    );
                    item.Facets.push(facet);
                }

                // Handle related links here
                if (data.Items.Item[i].Extension != undefined
                    && data.Items.Item[i].Extension.Related != undefined)
                    item.Links = data.Items.Item[i].Extension.Related.Link;

                this.collection.Items.push(item);
            }
        }

        //Extensions
        if (data.Extension != undefined) {
            if (data.Extension.Copyright != undefined) {
                this.collection.CopyrightName = data.Extension.Copyright.Name;
                this.collection.CopyrightHref = data.Extension.Copyright.Href;
            }
        }

        if (data.Items.Item.length > 0)
            $.publish("/PivotViewer/Models/Collection/Loaded", null);

    },
    JSONLoaded: function(data){
        Debug.Log('JSON loaded');

        this._hydrateCollections(data);

    },
    JSONLoadFailed: function(jqXHR, textStatus, errorThrown) {
        //Make sure throbber is removed else everyone thinks the app is still running
        $('.pv-loading').remove();

        //Display a message so the user knows something is wrong
        var msg = '';
        msg = msg + 'Error loading CXML Collection<br><br>';
        msg = msg + 'URL        : ' + this.url + '<br>';
        msg = msg + 'Status : ' + jqXHR.status + ' ' + errorThrown + '<br>';
        msg = msg + 'Details    : ' + jqXHR.responseText + '<br>';
        msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
        $('.pv-wrapper').append("<div id=\"pv-loading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
        var t=setTimeout(function(){window.open("#pv-loading-error","_self")},1000)
    }
});