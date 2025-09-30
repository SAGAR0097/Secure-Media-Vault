"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
var supabaseClient_1 = require("../supabaseClient");
var uuid_1 = require("uuid");
var node_fetch_1 = __importDefault(require("node-fetch"));
var EDGE_FUNCTION_URL = process.env.EDGE_FUNCTION_URL ||
    "http://localhost:54321/functions/v1/hash-object";
function fetchEdgeFunction(storagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_fetch_1.default)(EDGE_FUNCTION_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ storagePath: storagePath }),
                    })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Edge function failure");
                    return [4 /*yield*/, res.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
} // FIX: closed function
exports.resolvers = {
    Asset: {
        id: function (parent) { var _a, _b; return String((_b = (_a = parent.id) !== null && _a !== void 0 ? _a : parent.assetid) !== null && _b !== void 0 ? _b : ""); },
        filename: function (parent) { var _a, _b; return (_b = (_a = parent.filename) !== null && _a !== void 0 ? _a : parent.name) !== null && _b !== void 0 ? _b : "unknown"; },
        mime: function (parent) { var _a, _b; return (_b = (_a = parent.mime) !== null && _a !== void 0 ? _a : parent.type) !== null && _b !== void 0 ? _b : "application/octet-stream"; },
        size: function (parent) { var _a; return (_a = parent.size) !== null && _a !== void 0 ? _a : 0; },
        sha256: function (parent) { var _a; return (_a = parent.sha256) !== null && _a !== void 0 ? _a : null; },
        status: function (parent) { var _a; return (_a = parent.status) !== null && _a !== void 0 ? _a : "ready"; },
        version: function (parent) { var _a; return (_a = parent.version) !== null && _a !== void 0 ? _a : 1; },
        createdAt: function (parent) { var _a, _b; return (_b = (_a = parent.createdAt) !== null && _a !== void 0 ? _a : parent.created_at) !== null && _b !== void 0 ? _b : new Date(0).toISOString(); },
        updatedAt: function (parent) { var _a, _b; return (_b = (_a = parent.updatedAt) !== null && _a !== void 0 ? _a : parent.updated_at) !== null && _b !== void 0 ? _b : new Date(0).toISOString(); },
    },
    Query: {
        assets: function (_parent, _args, _context) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, data, error, err_1, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase.from("asset").select("*")];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, (data || [])];
                    case 2:
                        err_1 = _b.sent();
                        message = String((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || err_1);
                        // Supabase/PostgREST missing relation/table
                        if (message.includes("does not exist") || message.includes("relation") || message.includes("resource")) {
                            return [2 /*return*/, []];
                        }
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        }); },
        asset: function (_parent_1, _a, _context_1) { return __awaiter(void 0, [_parent_1, _a, _context_1], void 0, function (_parent, _b, _context) {
            var _c, data, error, err_2, message;
            var id = _b.id;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .select("*")
                                .eq("id", id)
                                .single()];
                    case 1:
                        _c = _d.sent(), data = _c.data, error = _c.error;
                        if (error || !data)
                            throw new Error("NOT_FOUND");
                        return [2 /*return*/, data];
                    case 2:
                        err_2 = _d.sent();
                        message = String((err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || err_2);
                        if (message.includes("does not exist") || message.includes("relation") || message.includes("resource")) {
                            throw new Error("NOT_FOUND");
                        }
                        throw err_2;
                    case 3: return [2 /*return*/];
                }
            });
        }); },
    },
    Mutation: {
        createUploadUrl: function (_parent_1, _a, context_1) { return __awaiter(void 0, [_parent_1, _a, context_1], void 0, function (_parent, _b, context) {
            var userId, assetId, nonce, storagePath, expiresAt, signedUrl, _c, data, error, err_3, message, retry;
            var _d;
            var filename = _b.filename, mime = _b.mime, size = _b.size;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!((_d = context.user) === null || _d === void 0 ? void 0 : _d.id))
                            throw new Error("UNAUTHENTICATED");
                        userId = context.user.id;
                        assetId = (0, uuid_1.v4)();
                        nonce = (0, uuid_1.v4)();
                        storagePath = "user_uploads/".concat(userId, "/").concat(assetId, "-").concat(filename);
                        return [4 /*yield*/, supabaseClient_1.supabase.from("asset").insert({
                                id: assetId,
                                ownerid: userId,
                                filename: filename,
                                mime: mime,
                                size: size,
                                storagepath: storagePath,
                                status: "draft",
                                version: 1,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            })];
                    case 1:
                        _e.sent();
                        expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                        return [4 /*yield*/, supabaseClient_1.supabase.from("uploadticket").insert({
                                assetid: assetId,
                                userid: userId,
                                nonce: nonce,
                                mime: mime,
                                size: size,
                                storagepath: storagePath,
                                expiresat: expiresAt,
                                used: false,
                            })];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 10]);
                        return [4 /*yield*/, supabaseClient_1.supabase.storage
                                .from("user-uploads")
                                .createSignedUploadUrl(storagePath)];
                    case 4:
                        _c = _e.sent(), data = _c.data, error = _c.error;
                        if (error)
                            throw error;
                        signedUrl = data.signedUrl;
                        return [3 /*break*/, 10];
                    case 5:
                        err_3 = _e.sent();
                        message = String((err_3 === null || err_3 === void 0 ? void 0 : err_3.message) || err_3);
                        if (!(message.includes("does not exist") || message.includes("resource") || (err_3 === null || err_3 === void 0 ? void 0 : err_3.status) === 404)) return [3 /*break*/, 8];
                        // Attempt to create the bucket, then retry once
                        return [4 /*yield*/, supabaseClient_1.supabase.storage.createBucket("user-uploads", { public: false })];
                    case 6:
                        // Attempt to create the bucket, then retry once
                        _e.sent();
                        return [4 /*yield*/, supabaseClient_1.supabase.storage
                                .from("user-uploads")
                                .createSignedUploadUrl(storagePath)];
                    case 7:
                        retry = _e.sent();
                        if (retry.error)
                            throw retry.error;
                        signedUrl = retry.data.signedUrl;
                        return [3 /*break*/, 9];
                    case 8: throw err_3;
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, {
                            assetId: assetId,
                            storagePath: storagePath,
                            uploadUrl: signedUrl,
                            expiresAt: expiresAt,
                            nonce: nonce,
                        }];
                }
            });
        }); },
        finalizeUpload: function (_parent_1, _a, context_1) { return __awaiter(void 0, [_parent_1, _a, context_1], void 0, function (_parent, _b, context) {
            var userId, _c, asset, error, sha256, newVersion;
            var _d;
            var assetId = _b.assetId, clientSha256 = _b.clientSha256, version = _b.version;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!((_d = context.user) === null || _d === void 0 ? void 0 : _d.id))
                            throw new Error("UNAUTHENTICATED");
                        userId = context.user.id;
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .select("*")
                                .eq("id", assetId)
                                .eq("ownerid", userId)
                                .single()];
                    case 1:
                        _c = _e.sent(), asset = _c.data, error = _c.error;
                        if (error || !asset)
                            throw new Error("NOT_FOUND");
                        if (asset.version !== version)
                            throw new Error("VERSIONCONFLICT");
                        return [4 /*yield*/, fetchEdgeFunction(asset.storagepath)];
                    case 2:
                        sha256 = (_e.sent()).sha256;
                        if (!(sha256 !== clientSha256)) return [3 /*break*/, 4];
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .update({ status: "corrupt", updatedAt: new Date().toISOString() })
                                .eq("id", assetId)];
                    case 3:
                        _e.sent();
                        throw new Error("INTEGRITY_FAILED");
                    case 4:
                        newVersion = version + 1;
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .update({
                                sha256: clientSha256,
                                status: "ready",
                                version: newVersion,
                                updatedAt: new Date().toISOString(),
                            })
                                .eq("id", assetId)];
                    case 5:
                        _e.sent();
                        return [2 /*return*/, __assign(__assign({}, asset), { sha256: clientSha256, status: "ready", version: newVersion, updatedAt: new Date().toISOString() })];
                }
            });
        }); },
        getDownloadUrl: function (_parent_1, _a, context_1) { return __awaiter(void 0, [_parent_1, _a, context_1], void 0, function (_parent, _b, context) {
            var userId, _c, asset, error, _d, count, err, _e, data, downloadErr;
            var _f;
            var assetId = _b.assetId;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!((_f = context.user) === null || _f === void 0 ? void 0 : _f.id))
                            throw new Error("UNAUTHENTICATED");
                        userId = context.user.id;
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .select("*")
                                .eq("id", assetId)
                                .single()];
                    case 1:
                        _c = _g.sent(), asset = _c.data, error = _c.error;
                        if (error || !asset)
                            throw new Error("NOT_FOUND");
                        if (!(asset.ownerid !== userId)) return [3 /*break*/, 3];
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("assetshare")
                                .select("*", { count: "exact" })
                                .eq("assetid", assetId)
                                .eq("touser", userId)
                                .eq("candownload", true)];
                    case 2:
                        _d = _g.sent(), count = _d.count, err = _d.error;
                        if (err)
                            throw err;
                        if (!count)
                            throw new Error("FORBIDDEN");
                        _g.label = 3;
                    case 3: return [4 /*yield*/, supabaseClient_1.supabase.storage
                            .from("user-uploads")
                            .createSignedUrl(asset.storagepath, 90)];
                    case 4:
                        _e = _g.sent(), data = _e.data, downloadErr = _e.error;
                        if (downloadErr)
                            throw downloadErr;
                        return [4 /*yield*/, supabaseClient_1.supabase.from("downloadaudit").insert({
                                assetid: assetId,
                                userid: userId,
                            })];
                    case 5:
                        _g.sent();
                        return [2 /*return*/, {
                                url: data.signedUrl,
                                expiresAt: new Date(Date.now() + 90 * 1000).toISOString(),
                            }];
                }
            });
        }); },
        renameAsset: function (_parent_1, _a, context_1) { return __awaiter(void 0, [_parent_1, _a, context_1], void 0, function (_parent, _b, context) {
            var userId, _c, asset, error;
            var _d;
            var assetId = _b.assetId, newFilename = _b.newFilename, version = _b.version;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!((_d = context.user) === null || _d === void 0 ? void 0 : _d.id))
                            throw new Error("UNAUTHENTICATED");
                        userId = context.user.id;
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .select("*")
                                .eq("id", assetId)
                                .eq("ownerid", userId)
                                .single()];
                    case 1:
                        _c = _e.sent(), asset = _c.data, error = _c.error;
                        if (error || !asset)
                            throw new Error("NOT_FOUND");
                        if (asset.version !== version)
                            throw new Error("VERSIONCONFLICT");
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .update({
                                filename: newFilename,
                                version: version + 1,
                                updatedAt: new Date().toISOString(),
                            })
                                .eq("id", assetId)];
                    case 2:
                        _e.sent();
                        return [2 /*return*/, __assign(__assign({}, asset), { filename: newFilename, version: version + 1, updatedAt: new Date().toISOString() })];
                }
            });
        }); },
        shareAsset: function (_parent_1, _a, context_1) { return __awaiter(void 0, [_parent_1, _a, context_1], void 0, function (_parent, _b, context) {
            var userId, _c, count, error;
            var _d;
            var assetId = _b.assetId, toUserId = _b.toUserId, canDownload = _b.canDownload;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!((_d = context.user) === null || _d === void 0 ? void 0 : _d.id))
                            throw new Error("UNAUTHENTICATED");
                        userId = context.user.id;
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("asset")
                                .select("*", { count: "exact" })
                                .eq("id", assetId)
                                .eq("ownerid", userId)];
                    case 1:
                        _c = _e.sent(), count = _c.count, error = _c.error;
                        if (error)
                            throw error;
                        if (!count)
                            throw new Error("FORBIDDEN");
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from("assetshare")
                                .upsert({ assetid: assetId, touser: toUserId, candownload: canDownload })];
                    case 2:
                        _e.sent();
                        return [2 /*return*/, true];
                }
            });
        }); },
    },
};
