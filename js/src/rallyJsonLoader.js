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
        this.collection.BrandImage = location.origin+'/rallypivotviewer/images/logo.jpg';
        this.data = {};
        this.data.CollectionName = 'Artifacts in Kumquats';
        this.data.FacetCategories = {
            "FacetCategory": [
                {
                    "Name": "Name",
                    "Type": "String",
                    "IsWordWheelVisible": "true",
                    "IsFilterVisible": "true"
                },
                {
                    "Name": "Defect Status",
                    "Type": "String",
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
                    "Name": "Type",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "FormattedID",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible" : "false",
                    "IsWordWheelVisible" : "true"
                },
                {
                    "Name": "Priority",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible" : "false",
                    "IsWordWheelVisible" : "true"
                },
                {
                    "Name": "Severity",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible" : "false",
                    "IsWordWheelVisible" : "true"
                },
                {
                    "Name": "State",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible" : "false",
                    "IsWordWheelVisible" : "true"
                },
                {
                    "Name": "Task Estimate",
                    "Type": "Number",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Project",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Resolution",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                },
                {
                    "Name": "Owner",
                    "Type": "String",
                    "IsFilterVisible": "true",
                    "IsMetaDataVisible": "true"
                }
            ]
        };

        this.data.Items = {
            ImgBase: location.origin+'/rallypivotviewer/images',
            Item: []
        };

        this._makeXHR(this.JSONUri);

    },
    _makeXHR: function(url){
        var myRequest = new XMLHttpRequest();

        myRequest.withCredentials = true;
        myRequest.open('GET', url);
        console.log('Request sent: '+url);
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
    JSONLoaded: function(data){
        console.log('JSON start loading '+data.QueryResult.StartIndex+' record');
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
    },
    _hydrateCollections: function(data){

        data = data.QueryResult;
        if(data.StartIndex === 1){
            this.totalItems = Math.min(data.TotalResultCount-1, 1000);
            if(this.totalItems === 1000){
                $('#lblLoading').text("Loaded: 0 / "+this.totalItems);
            }
            this.pageSize = data.PageSize;
            this.itemsLoaded = 0;
        }

        for(var i=0; i< (this.pageSize > data.Results.length ? data.Results.length : this.pageSize); i++){
            var currentItem = data.Results[i];

            var myRequest = new XMLHttpRequest();
            myRequest.withCredentials = true;
            myRequest.open('GET', currentItem._ref);
            myRequest.context = this;
            myRequest.onreadystatechange = function () {
                if (this.status == 200 && this.readyState == 4 && this.context.itemsLoaded < this.context.totalItems) {
                    this.context._loadNextArtifact($.parseJSON(this.responseText), this.context.itemsLoaded);
                }
                else if(this.status != 200){
                    this.context.JSONLoadFailed(this);
                }
            };
            myRequest.send();
        }
        if(data.StartIndex === 1){
            var pages = this.totalItems/this.pageSize;
            for(i=1; i<pages; i++){
                this._loadNextDataPage((i*this.pageSize)+1);
            }
        }
    },

    _loadNextDataPage: function(startIndex){
        this._makeXHR(this.JSONUri + '&start='+startIndex);
    },
    _loadNextArtifact: function(newData, newId){

        var currentType;

        if(newData.HierarchicalRequirement){
            newData = newData.HierarchicalRequirement;
            currentType = "User Story";
        }
        else if(newData.Defect){
            newData = newData.Defect;
            currentType = "Defect";
        }
        else if(newData.Initiative){
            newData = newData.Initiative;
            currentType = "Initiative";
        }
        else if(newData.Feature){
            newData = newData.Feature;
            currentType = "Feature";
        }
        else if(newData.Task){
            newData = newData.Task;
            currentType = "Task";
        }

        var item = {};
        item.Name = newData.FormattedID;
        item.Description = newData.Description;
        item.Extension = "\n\t";
        item.Id = newId;
        switch(currentType){
            case 'Defect':
                item.Img = 'defect.jpg';
                break;
            case 'Feature':
                item.Img = 'feature.jpg';
                break;
            case 'User Story':
                item.Img = 'userStory.jpg';
                break;
            case 'Initiative':
                item.Img = 'initiative.jpg';
                break;
            case 'Task':
                item.Img = 'task.jpg';
                break;
            default:
                item.Img = 'unknown.jpg';
                break;
        }

        item.Href='https://rally1.rallydev.com/#/'+currentProject+"/detail/"+currentType+"/"+newData.ObjectID;

        item.Facets = {
            Facet: []
        };

        item.Facets.Facet.push(
            {
                "String": {
                    "Value": newData.Name ? newData.Name : ""
                },
                "Name": "Name"
            },
            {
                "String": {
                    "Value": newData.DefectStatus ? newData.DefectStatus : ""
                },
                "Name": "Defect Status"
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
                "String":{
                    "Value": newData.FormattedID ? newData.FormattedID : ""
                },
                "Name": "FormattedID"
            },
            {
                "String":{
                    "Value": newData.Priority ? newData.Priority : ""
                },
                "Name": "Priority"
            },
            {
                "String":{
                    "Value": newData.Severity ? newData.Severity : ""
                },
                "Name": "Severity"
            },
            {
                "String":{
                    "Value": newData.State ? typeof newData.State === "object" ? newData.State._refObjectName : newData.State : ""
                },
                "Name": "State"
            },
            {
                "Number":{
                    "Value": newData.TaskEstimateTotal ? newData.TaskEstimateTotal: 0
                },
                "Name": "Task Estimate"
            },
            {
                "String":{
                    "Value": newData.Project ? newData.Project._refObjectName : ""
                },
                "Name": "Project"
            },
            {
                "String":{
                    "Value": newData.Resolution ? newData.Resolution : ""
                },
                "Name": "Resolution"
            },
            {
                "String":{
                    "Value": newData.Owner? newData.Owner._refObjectName ? newData.Owner._refObjectName : newData.Owner : ""
                },
                "Name": "Owner"
            }
        );

        this.data.Items.Item.push(item);
        this.itemsLoaded++;
        $('#lblLoading').text("Loaded: "+this.itemsLoaded + " / " + this.totalItems);

        if(this.itemsLoaded === this.totalItems){
            $('#lblLoading').text("Rendering Now...");
            this._continueLoad(this.data);
        }

    },

    _continueLoad: function(data){
        console.log('---Load Complete, continuing render---');
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

    }

});
