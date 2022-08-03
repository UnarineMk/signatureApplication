import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonToast,
  useIonRouter,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Signature.css";
import { Avatar } from "../components/Avatar";
import { useRef } from "react";
import SignaturePad from "react-signature-canvas";
import Popup from "reactjs-popup";

export function AccountPage() {
  const [imageURL, setImageURL] = useState(null);
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const router = useIonRouter();
  const [profile, setProfile] = useState({
    username: "",
    avatar_url: "",
    address: "",
    contacts: "",
    signature_url: "",
    province: "",
    country: "",
    city: "",
  });

  const sigCanvas = useRef<any>({});
  const clear = () => sigCanvas.current.clear();
  const save = () => {
    setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
    alert("Signature saved in Database");
  };

  console.log(imageURL);

  useEffect(() => {
    getProfile();
  }, [session]);
  const getProfile = async () => {
    console.log("get");
    await showLoading();
    try {
      const user = supabase.auth.user();
      let { data, error, status } = await supabase
        .from("profiles")
        .select(
          `username,avatar_url,address,contacts,signature_url,province,country,city`
        )
        .eq("id", user!.id)
        .limit(100)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile({
          username: data.username,
          avatar_url: data.avatar_url,
          address: data.address,
          contacts: data.contacts,
          signature_url: data.signature_url,
          country: data.country,
          city: data.city,
          province: data.province,
        });
      }
    } catch (error: any) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/", "forward", "replace");
  };
  const updateProfile = async (e?: any, avatar_url: string = "") => {
    e?.preventDefault();

    console.log("update ");
    await showLoading();

    try {
      const user = supabase.auth.user();

      const updates = {
        id: user!.id,
        ...profile,
        avatar_url: avatar_url,
        signature_url: imageURL,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates, {
        returning: "minimal", // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <Avatar url={profile.avatar_url} onUpload={updateProfile}></Avatar>

        <form onSubmit={updateProfile}>
          <IonItem>
            <IonLabel>
              <p>Email</p>
              <p>{session?.user?.email}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Full Names</IonLabel>
            <IonInput
              type="text"
              name="username"
              value={profile.username}
              onIonChange={(e) =>
                setProfile({ ...profile, username: e.detail.value ?? "" })
              }
            ></IonInput>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Country</IonLabel>
            <IonInput
              type="text"
              name="address"
              value={profile.country}
              onIonChange={(e) =>
                setProfile({ ...profile, country: e.detail.value ?? "" })
              }
            ></IonInput>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Province</IonLabel>
            <IonInput
              type="text"
              name="address"
              value={profile.province}
              onIonChange={(e) =>
                setProfile({ ...profile, province: e.detail.value ?? "" })
              }
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">City</IonLabel>
            <IonInput
              type="text"
              name="address"
              value={profile.city}
              onIonChange={(e) =>
                setProfile({ ...profile, city: e.detail.value ?? "" })
              }
            ></IonInput>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Address</IonLabel>
            <IonInput
              type="text"
              name="address"
              value={profile.address}
              onIonChange={(e) =>
                setProfile({ ...profile, address: e.detail.value ?? "" })
              }
            ></IonInput>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Contact Details</IonLabel>
            <IonInput
              type="text"
              name="contacts"
              value={profile.contacts}
              onIonChange={(e) =>
                setProfile({ ...profile, contacts: e.detail.value ?? "" })
              }
            ></IonInput>
          </IonItem>

          {imageURL ? (
            <img
              src={imageURL}
              alt="My Signature"
              style={{
                display: "block",
                margin: "0 auto",
                border: "1px solid white",
                width: "150px",
                background: "white",
              }}
            />
          ) : null}

          <div className="signature">
            <Popup
              className="popup"
              modal
              trigger={
                <div className="ion-text-center">
                  <IonButton>Sign to confirm</IonButton>
                </div>
              }
              closeOnDocumentClick={true}
            >
              <SignaturePad
                ref={sigCanvas}
                canvasProps={{
                  className: "signatureCanvas",
                }}
              />
              <div className="buttons">
                {/* <IonButton onClick={close} color="danger">
                  Close
                </IonButton> */}
                <IonButton onClick={clear}>Clear</IonButton>
                <IonButton onClick={save} color="success">
                  Save
                </IonButton>
              </div>
            </Popup>
          </div>

          <div className="ion-text-center">
            <IonButton fill="clear" type="submit">
              Update Profile
            </IonButton>
          </div>
        </form>

        <div className="ion-text-center">
          <IonButton fill="clear" onClick={signOut}>
            Log Out
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
