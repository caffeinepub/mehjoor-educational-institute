import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
actor self {
  type Inquiry = {
    id : Nat;
    name : Text;
    classLevel : Text;
    message : Text;
    timestamp : Int;
  };

  type Assessment = {
    id : Nat;
    title : Text;
    subject : Text;
    classLevel : Text;
    date : Int;
    description : Text;
    timestamp : Int;
    fileUrl : ?Text;
  };

  type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    timestamp : Int;
  };

  module Assessment {
    public func compare(assessment1 : Assessment, assessment2 : Assessment) : Order.Order {
      Text.compare(assessment1.id.toText(), assessment2.id.toText());
    };
  };

  module Announcement {
    public func compare(announcement1 : Announcement, announcement2 : Announcement) : Order.Order {
      Int.compare(announcement1.timestamp, announcement2.timestamp);
    };
  };

  var owner : ?Principal = null;

  // Called once by the deployer to claim ownership
  public shared ({ caller }) func setOwner() : async () {
    switch (owner) {
      case (null) { owner := ?caller };
      case (?_) { Runtime.trap("Owner already set") };
    };
  };

  public query func getOwner() : async ?Principal {
    owner;
  };

  let inquiries = Map.empty<Nat, Inquiry>();
  let assessments = Map.empty<Nat, Assessment>();
  let announcements = Map.empty<Nat, Announcement>();

  var nextInquiryId = 0;
  var nextAssessmentId = 0;
  var nextAnnouncementId = 0;

  public shared ({ caller }) func addInquiry(name : Text, classLevel : Text, message : Text) : async Nat {
    let inquiry : Inquiry = {
      id = nextInquiryId;
      name;
      classLevel;
      message;
      timestamp = Time.now();
    };
    inquiries.add(nextInquiryId, inquiry);
    nextInquiryId += 1;
    inquiry.id;
  };

  public shared ({ caller }) func addAssessment(title : Text, subject : Text, classLevel : Text, date : Int, description : Text, fileUrl : ?Text) : async Nat {
    switch (owner) {
      case (null) { Runtime.trap("No owner set. Call setOwner first.") };
      case (?o) {
        if (caller != o) {
          Runtime.trap("Unauthorized: only the owner can add assessments.");
        };
      };
    };
    let assessment : Assessment = {
      id = nextAssessmentId;
      title;
      subject;
      classLevel;
      date;
      description;
      timestamp = Time.now();
      fileUrl;
    };
    assessments.add(nextAssessmentId, assessment);
    nextAssessmentId += 1;
    assessment.id;
  };

  public shared ({ caller }) func addAnnouncement(title : Text, content : Text) : async Nat {
    switch (owner) {
      case (null) { Runtime.trap("No owner set. Call setOwner first.") };
      case (?o) {
        if (caller != o) {
          Runtime.trap("Unauthorized: only the owner can add announcements.");
        };
      };
    };
    let announcement : Announcement = {
      id = nextAnnouncementId;
      title;
      content;
      timestamp = Time.now();
    };
    announcements.add(nextAnnouncementId, announcement);
    nextAnnouncementId += 1;
    announcement.id;
  };

  public query ({ caller }) func getInquiries() : async [Inquiry] {
    inquiries.values().toArray();
  };

  public shared ({ caller }) func getInquiriesOwner() : async [Inquiry] {
    switch (owner) {
      case (null) { Runtime.trap("No owner set.") };
      case (?o) {
        if (caller != o) {
          Runtime.trap("Unauthorized");
        };
      };
    };
    let all = inquiries.values().toArray();
    all.sort(func(a : Inquiry, b : Inquiry) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });
  };

  public query ({ caller }) func getAssessment(id : Nat) : async Assessment {
    switch (assessments.get(id)) {
      case (null) { Runtime.trap("Assessment id " # id.toText() # " is not in the assessments map. ") };
      case (?assessment) { assessment };
    };
  };

  public query ({ caller }) func getAssessments() : async [Assessment] {
    assessments.values().toArray().sort();
  };

  public query ({ caller }) func getAnnouncements() : async [Announcement] {
    announcements.values().toArray().sort();
  };

  public query ({ caller }) func getAnnouncement(id : Nat) : async Announcement {
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement does not exist.") };
      case (?announcement) { announcement };
    };
  };
};
